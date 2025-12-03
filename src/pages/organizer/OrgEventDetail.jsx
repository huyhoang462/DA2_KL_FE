import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEventById,
  updateEvent,
  deleteEvent,
} from '../../services/eventService';

import Button from '../../components/ui/Button';
import NotificationModal from '../../components/ui/NotificationModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Save, X, Loader2, Trash2, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

import BasicInfoForm from '../../components/features/createEvent/BasicInfoForm';
import ShowsInfoForm from '../../components/features/createEvent/ShowsInfoForm';
import PaymentInfoForm from '../../components/features/createEvent/PaymentInfoForm';

import {
  validateStepOne,
  validateStepTwo,
  validateStepThree,
} from '../../utils/validation';
import set from 'lodash.set';

const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  try {
    return isoString.split('T')[0];
  } catch (e) {
    return '';
  }
};

const formatDateTimeForInput = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error('Error formatting datetime:', e);
    return '';
  }
};

const formatDateTimeForAPI = (datetimeLocal) => {
  if (!datetimeLocal) return null;
  try {
    return new Date(datetimeLocal).toISOString();
  } catch (e) {
    console.error('Error formatting datetime for API:', e);
    return null;
  }
};

const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

const createDifferentialUpdate = (firstData, editData) => {
  const updatePayload = {};

  const basicFields = ['name', 'description', 'startDate', 'endDate', 'format'];
  basicFields.forEach((field) => {
    if (firstData[field] !== editData[field]) {
      updatePayload[field] = editData[field];
    }
  });

  const firstLocation = {
    street: firstData.location?.street || '',
    ward: firstData.location?.ward || null,
    province: firstData.location?.province || null,
  };
  const editLocation = {
    street: editData.location?.street || '',
    ward: editData.location?.ward || null,
    province: editData.location?.province || null,
  };

  if (!deepEqual(firstLocation, editLocation)) {
    updatePayload.location = {
      street: editData.location?.street || '',
      ward: editData.location?.ward || null,
      province: editData.location?.province || null,
    };
  }

  if (!deepEqual(firstData.organizer, editData.organizer)) {
    updatePayload.organizer = editData.organizer;
  }

  const firstCategory = firstData.category || '';
  const editCategory = editData.category || '';
  if (firstCategory !== editCategory) {
    updatePayload.category = editCategory;
  }

  if (!deepEqual(firstData.bannerImageUrl, editData.bannerImageUrl)) {
    updatePayload.bannerImageUrl = editData.bannerImageUrl;
  }

  const firstPayoutMethod = {
    methodType: firstData.payoutMethod?.methodType || 'bank_account',
    id: firstData.payoutMethod?.id || null,
    bankDetails: firstData.payoutMethod?.bankDetails || {},
    momoDetails: firstData.payoutMethod?.momoDetails || {},
  };

  const editPayoutMethod = {
    methodType: editData.payoutMethod?.methodType || 'bank_account',
    id: editData.payoutMethod?.id || null,
    bankDetails: editData.payoutMethod?.bankDetails || {},
    momoDetails: editData.payoutMethod?.momoDetails || {},
  };

  if (!deepEqual(firstPayoutMethod, editPayoutMethod)) {
    updatePayload.payoutMethod = editData.payoutMethod;
  }

  const showsOperations = {
    create: [],
    update: [],
    delete: [],
  };

  const firstShows = firstData.shows || [];
  const editShows = editData.shows || [];

  firstShows.forEach((firstShow) => {
    if (
      firstShow._id &&
      !editShows.find((editShow) => editShow._id === firstShow._id)
    ) {
      showsOperations.delete.push(firstShow._id);
    }
  });

  editShows.forEach((editShow) => {
    if (!editShow._id || editShow._id.startsWith('temp_')) {
      const { _id, tickets, ...showData } = editShow;

      const tempShowId = editShow._id || `temp_${Date.now()}_${Math.random()}`;

      showsOperations.create.push({
        ...showData,
        tempId: tempShowId,
        tickets: tickets || [],
      });
    } else {
      const originalShow = firstShows.find((s) => s._id === editShow._id);
      if (originalShow) {
        const {
          tickets: editTickets,
          _id,
          __v,
          createdAt,
          updatedAt,
          ...editShowData
        } = editShow;
        const {
          tickets: originalTickets,
          _id: origId,
          __v: origV,
          createdAt: origCreated,
          updatedAt: origUpdated,
          ...originalShowData
        } = originalShow;

        if (!deepEqual(originalShowData, editShowData)) {
          showsOperations.update.push({
            id: editShow._id,
            ...editShowData,
          });
        }
      }
    }
  });

  const ticketsOperations = {
    create: [],
    update: [],
    delete: [],
  };

  const existingEditShows = editShows.filter(
    (show) => show._id && !show._id.startsWith('temp_')
  );

  existingEditShows.forEach((editShow) => {
    const originalShow = firstShows.find((s) => s._id === editShow._id);
    if (!originalShow) return;

    const originalTickets = originalShow.tickets || [];
    const editTickets = editShow.tickets || [];

    originalTickets.forEach((originalTicket) => {
      if (
        originalTicket._id &&
        !editTickets.find((editTicket) => editTicket._id === originalTicket._id)
      ) {
        ticketsOperations.delete.push(originalTicket._id);
      }
    });

    editTickets.forEach((editTicket) => {
      if (!editTicket._id || editTicket._id.startsWith('temp_')) {
        const { _id, __v, createdAt, updatedAt, ...ticketData } = editTicket;
        ticketsOperations.create.push({
          ...ticketData,
          showId: editShow._id,
        });
      } else {
        const originalTicket = originalTickets.find(
          (t) => t._id === editTicket._id
        );
        if (originalTicket) {
          const {
            _id: editId,
            __v,
            createdAt,
            updatedAt,
            showId,
            ...editTicketData
          } = editTicket;
          const {
            _id: origId,
            __v: origV,
            createdAt: origCreated,
            updatedAt: origUpdated,
            showId: origShowId,
            ...originalTicketData
          } = originalTicket;

          if (!deepEqual(originalTicketData, editTicketData)) {
            ticketsOperations.update.push({
              id: editTicket._id,
              ...editTicketData,
            });
          }
        }
      }
    });
  });

  if (
    showsOperations.create.length > 0 ||
    showsOperations.update.length > 0 ||
    showsOperations.delete.length > 0
  ) {
    updatePayload.shows = showsOperations;
  }

  if (
    ticketsOperations.create.length > 0 ||
    ticketsOperations.update.length > 0 ||
    ticketsOperations.delete.length > 0
  ) {
    updatePayload.tickets = ticketsOperations;
  }

  return updatePayload;
};

const formatUpdatePayloadForAPI = (updatePayload) => {
  const formatted = { ...updatePayload };

  if (formatted.startDate) {
    formatted.startDate = new Date(formatted.startDate).toISOString();
  }
  if (formatted.endDate) {
    formatted.endDate = new Date(formatted.endDate).toISOString();
  }

  if (
    formatted.bannerImageUrl &&
    typeof formatted.bannerImageUrl === 'object'
  ) {
    formatted.bannerImageUrl = formatted.bannerImageUrl.url || '';
  }

  if (formatted.shows) {
    if (formatted.shows.create) {
      formatted.shows.create = formatted.shows.create.map((show) => ({
        ...show,
        startTime: formatDateTimeForAPI(show.startTime),
        endTime: formatDateTimeForAPI(show.endTime),
        tickets:
          show.tickets?.map((ticket) => ({
            ...ticket,
          })) || [],
      }));
    }
    if (formatted.shows.update) {
      formatted.shows.update = formatted.shows.update.map((show) => ({
        ...show,
        startTime: show.startTime
          ? formatDateTimeForAPI(show.startTime)
          : undefined,
        endTime: show.endTime ? formatDateTimeForAPI(show.endTime) : undefined,
      }));
    }
  }

  return formatted;
};

export default function OrgEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [firstData, setFirstData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [errors, setErrors] = useState({});

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationInfo, setNotificationInfo] = useState({
    type: 'success',
    title: '',
    message: '',
  });

  const {
    data: originalEvent,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['eventDetailForEdit', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (originalEvent) {
      try {
        const preparedData = {
          ...originalEvent,

          bannerImageUrl: originalEvent.bannerImageUrl
            ? typeof originalEvent.bannerImageUrl === 'string'
              ? {
                  url: originalEvent.bannerImageUrl,
                  publicId:
                    originalEvent.bannerImageUrl
                      .split('/')
                      .pop()
                      .split('.')[0] || '',
                }
              : {
                  url: originalEvent.bannerImageUrl.url || '',
                  publicId: originalEvent.bannerImageUrl.publicId || '',
                }
            : { url: '', publicId: '' },

          startDate: formatDateForInput(originalEvent.startDate),
          endDate: formatDateForInput(originalEvent.endDate),

          category:
            originalEvent.category?._id ||
            originalEvent.category?.id ||
            (typeof originalEvent.category === 'string'
              ? originalEvent.category
              : '') ||
            '',

          location: {
            street: originalEvent.location?.street || '',
            ward: originalEvent.location?.ward
              ? {
                  code: originalEvent.location.ward.code,
                  name: originalEvent.location.ward.name,
                }
              : null,
            province: originalEvent.location?.province
              ? {
                  code: originalEvent.location.province.code,
                  name: originalEvent.location.province.name,
                }
              : null,
          },

          organizer: {
            name: originalEvent.organizer?.name || '',
            email: originalEvent.organizer?.email || '',
            phone: originalEvent.organizer?.phone || '',
            description: originalEvent.organizer?.description || '',
          },

          shows:
            originalEvent.shows?.map((show) => ({
              _id: show._id,
              name: show.name || '',
              startTime: formatDateTimeForInput(show.startTime),
              endTime: formatDateTimeForInput(show.endTime),
              event: show.event,
              createdAt: show.createdAt,
              updatedAt: show.updatedAt,
              __v: show.__v,
              tickets:
                show.tickets?.map((ticket) => ({
                  _id: ticket._id,
                  name: ticket.name || '',
                  price: ticket.price || 0,
                  quantityTotal: ticket.quantityTotal || 0,
                  quantitySold: ticket.quantitySold || 0,
                  minPurchase: ticket.minPurchase || 1,
                  maxPurchase: ticket.maxPurchase || 10,
                  description: ticket.description || '',
                  show: ticket.show,
                  createdAt: ticket.createdAt,
                  updatedAt: ticket.updatedAt,
                  __v: ticket.__v,
                })) || [],
            })) || [],

          payoutMethod: {
            methodType:
              originalEvent.payoutMethod?.methodType || 'bank_account',
            id: originalEvent.payoutMethod?.id || null,
            bankDetails: {
              bankName: originalEvent.payoutMethod?.bankDetails?.bankName || '',
              accountNumber:
                originalEvent.payoutMethod?.bankDetails?.accountNumber || '',
              accountName:
                originalEvent.payoutMethod?.bankDetails?.accountName || '',
              bankBranch:
                originalEvent.payoutMethod?.bankDetails?.bankBranch || '',
            },
            momoDetails: {
              phoneNumber:
                originalEvent.payoutMethod?.momoDetails?.phoneNumber || '',
              accountName:
                originalEvent.payoutMethod?.momoDetails?.accountName || '',
            },
          },
        };

        const firstDataCopy = JSON.parse(JSON.stringify(preparedData));
        const editDataCopy = JSON.parse(JSON.stringify(preparedData));

        setFirstData(firstDataCopy);
        setEditData(editDataCopy);

        console.log('✅ First data (immutable):', firstDataCopy);
        console.log('✅ Edit data (mutable):', editDataCopy);
        console.log(
          '✅ Are they same reference?',
          firstDataCopy === editDataCopy
        );
        console.log(
          '✅ Are location same reference?',
          firstDataCopy.location === editDataCopy.location
        );
      } catch (error) {
        console.error('❌ Error preparing data:', error);
      }
    }
  }, [originalEvent]);

  const updateMutation = useMutation({
    mutationFn: (updatePayload) => {
      console.log('🚀 Sending differential update:', updatePayload);
      return updateEvent(id, updatePayload);
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries(['eventDetailForEdit', id]);
      setFirstData(JSON.parse(JSON.stringify(editData)));

      setNotificationInfo({
        type: 'success',
        title: 'Thành công!',
        message: 'Đã cập nhật sự kiện thành công.',
      });
      setShowNotification(true);
    },
    onError: (err) => {
      console.error('❌ Update error:', err);
      setNotificationInfo({
        type: 'error',
        title: 'Thất bại!',
        message: err.message || 'Đã có lỗi xảy ra khi cập nhật.',
      });
      setShowNotification(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      setNotificationInfo({
        type: 'success',
        title: 'Thành công!',
        message: 'Đã xóa sự kiện thành công.',
      });
      setShowNotification(true);

      setTimeout(() => {
        navigate('/organizer/my-events');
      }, 2000);
    },
    onError: (err) => {
      console.error('❌ Delete error:', err);
      setNotificationInfo({
        type: 'error',
        title: 'Thất bại!',
        message: err.message || 'Đã có lỗi xảy ra khi xóa sự kiện.',
      });
      setShowNotification(true);
    },
  });

  const hasChanges = firstData && editData && !deepEqual(firstData, editData);

  const handleFieldChange = (fieldPath, value) => {
    setEditData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      set(newData, fieldPath, value);
      return newData;
    });

    const errorKey = fieldPath.split('.')[0];
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleSaveClick = () => {
    if (updateMutation.isPending || !hasChanges) return;
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    try {
      const stepOneErrors = validateStepOne(editData);
      const stepTwoErrors = validateStepTwo(editData);
      const stepThreeErrors = validateStepThree(editData);
      const allErrors = {
        ...stepOneErrors,
        ...stepTwoErrors,
        ...stepThreeErrors,
      };

      setErrors(allErrors);

      if (Object.keys(allErrors).length === 0) {
        const updatePayload = createDifferentialUpdate(firstData, editData);
        const formattedPayload = formatUpdatePayloadForAPI(updatePayload);

        console.log('📊 Differential update payload:', formattedPayload);

        if (Object.keys(formattedPayload).length === 0) {
          setNotificationInfo({
            type: 'info',
            title: 'Thông báo',
            message: 'Không có thay đổi nào để lưu.',
          });
          setShowNotification(true);
          setShowSaveConfirm(false);
          return;
        }

        updateMutation.mutate(formattedPayload);
        setShowSaveConfirm(false);
      } else {
        setShowSaveConfirm(false);
        setNotificationInfo({
          type: 'error',
          title: 'Lỗi validation!',
          message: 'Vui lòng kiểm tra lại thông tin đã nhập.',
        });
        setShowNotification(true);
        console.log('❌ Validation errors:', allErrors);
      }
    } catch (error) {
      console.error('❌ Error in handleConfirmSave:', error);
      setShowSaveConfirm(false);
      setNotificationInfo({
        type: 'error',
        title: 'Lỗi!',
        message: 'Đã có lỗi xảy ra khi xử lý dữ liệu.',
      });
      setShowNotification(true);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const handleResetChanges = () => {
    if (firstData) {
      setEditData(JSON.parse(JSON.stringify(firstData)));
      setErrors({});
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const DebugDifferentialData = () => {
    if (!firstData || !editData || process.env.NODE_ENV !== 'development')
      return null;

    const updatePayload = createDifferentialUpdate(firstData, editData);
    const formattedPayload = formatUpdatePayloadForAPI(updatePayload);

    if (Object.keys(formattedPayload).length === 0) return null;

    return (
      <div className="fixed right-4 bottom-4 z-50 max-w-md rounded-lg bg-gray-900 p-4 text-xs text-white shadow-lg">
        <h4 className="mb-2 font-bold text-yellow-400">
          🔧 Differential Update:
        </h4>
        <pre className="max-h-40 overflow-auto text-green-300">
          {JSON.stringify(formattedPayload, null, 2)}
        </pre>
        <div className="mt-2 text-xs text-gray-400">
          Changes: {Object.keys(formattedPayload).join(', ')}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorDisplay
        message={error?.message || 'Không thể tải dữ liệu sự kiện.'}
      />
    );
  }

  if (!editData || !firstData) {
    return null;
  }

  const isEditable =
    originalEvent?.status === 'draft' || originalEvent?.status === 'pending';

  const getStatusInfo = (status) => {
    const statusMap = {
      draft: {
        label: 'Bản nháp',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      pending: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      upcoming: {
        label: 'Sắp diễn ra',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      ongoing: {
        label: 'Đang diễn ra',
        color: 'bg-green-100 text-green-800 border-green-200',
      },
      completed: {
        label: 'Đã hoàn thành',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      rejected: {
        label: 'Bị từ chối',
        color: 'bg-red-100 text-red-800 border-red-200',
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'bg-slate-100 text-slate-800 border-slate-200',
      },
    };
    return statusMap[status] || statusMap.draft;
  };

  const statusInfo = getStatusInfo(originalEvent.status);

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <header className="sticky top-13 z-10 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm md:top-0">
        <div className="mx-auto px-4 py-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {editData.name || 'Chi tiết sự kiện'}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
                {originalEvent.createdAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="inline h-4 w-4" />
                    {new Date(originalEvent.createdAt).toLocaleDateString(
                      'vi-VN'
                    )}
                  </div>
                )}
                {hasChanges && isEditable && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    Có thay đổi chưa lưu
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isEditable ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      size="sm"
                      disabled={
                        updateMutation.isPending || deleteMutation.isPending
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleSaveClick}
                      disabled={
                        !hasChanges ||
                        updateMutation.isPending ||
                        deleteMutation.isPending
                      }
                      className="text-primary-foreground"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Lưu thay đổi
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div
          className={`container mx-auto px-4 py-8 transition-all duration-200 ${
            updateMutation.isPending || deleteMutation.isPending
              ? 'pointer-events-none opacity-60'
              : ''
          }`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="space-y-8">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông tin cơ bản
                  </h3>
                </div>
                <div className="p-6">
                  <BasicInfoForm
                    value={editData}
                    onChange={handleFieldChange}
                    errors={errors}
                    isEditable={isEditable}
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông tin buổi diễn
                  </h3>
                </div>
                <div className="p-6">
                  <ShowsInfoForm
                    value={editData.shows}
                    onChange={handleFieldChange}
                    errors={errors}
                    isEditable={isEditable}
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông tin thanh toán
                  </h3>
                </div>
                <div className="p-6">
                  <PaymentInfoForm
                    value={editData.payoutMethod}
                    onChange={handleFieldChange}
                    errors={errors}
                    isEditable={isEditable}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title="Xác nhận lưu thay đổi"
        message="Bạn có chắc chắn muốn lưu những thay đổi này không?"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
        confirmText="Lưu"
        cancelText="Hủy"
        confirmVariant="default"
        icon={
          <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Save className="text-primary h-6 w-6" />
          </div>
        }
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa sự kiện"
        message="Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />

      <NotificationModal
        isOpen={showNotification}
        type={notificationInfo.type}
        title={notificationInfo.title}
        message={notificationInfo.message}
        onClose={handleNotificationClose}
      />

      <DebugDifferentialData />
    </div>
  );
}
