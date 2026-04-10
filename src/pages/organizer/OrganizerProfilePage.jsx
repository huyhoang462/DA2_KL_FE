import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Mail, Phone, Save } from 'lucide-react';
import { toast } from 'react-toastify';

import Button from '../../components/ui/Button';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import { validateEmail, validatePhone } from '../../utils/validation';
import {
  getOrganizerProfile,
  updateOrganizerProfile,
} from '../../services/organizerProfileService';
import { setUser } from '../../store/slices/authSlice';

const MAX_LENGTHS = {
  displayName: 120,
  phone: 30,
  address: 255,
  about: 1000,
};

const normalizeValue = (value) => (typeof value === 'string' ? value : '');

const OrganizerProfilePage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const authUser = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    displayName: '',
    contactEmail: '',
    phone: '',
    address: '',
    about: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const profileQuery = useQuery({
    queryKey: ['organizer-profile'],
    queryFn: getOrganizerProfile,
  });

  const profile = profileQuery.data?.profile;

  useEffect(() => {
    if (!profile) return;

    setForm({
      displayName: normalizeValue(profile.displayName),
      contactEmail: normalizeValue(profile.contactEmail),
      phone: normalizeValue(profile.phone),
      address: normalizeValue(profile.address),
      about: normalizeValue(profile.about),
    });
    setFormErrors({});
  }, [profile]);

  const hasUnsavedChanges = useMemo(() => {
    if (!profile) return false;

    return (
      normalizeValue(profile.displayName) !== form.displayName ||
      normalizeValue(profile.contactEmail) !== form.contactEmail ||
      normalizeValue(profile.phone) !== form.phone ||
      normalizeValue(profile.address) !== form.address ||
      normalizeValue(profile.about) !== form.about
    );
  }, [form, profile]);

  const updateMutation = useMutation({
    mutationFn: updateOrganizerProfile,
    onSuccess: (data) => {
      const updatedProfile = data?.profile;

      queryClient.setQueryData(['organizer-profile'], data);
      setForm({
        displayName: normalizeValue(updatedProfile?.displayName),
        contactEmail: normalizeValue(updatedProfile?.contactEmail),
        phone: normalizeValue(updatedProfile?.phone),
        address: normalizeValue(updatedProfile?.address),
        about: normalizeValue(updatedProfile?.about),
      });
      setFormErrors({});

      if (updatedProfile?.displayName) {
        dispatch(
          setUser({
            ...(authUser || {}),
            name: updatedProfile.displayName,
            fullName: updatedProfile.displayName,
            phone: updatedProfile.phone ?? authUser?.phone,
          })
        );
      }

      toast.success(data?.message || 'Cập nhật hồ sơ thành công.');
    },
    onError: (error) => {
      toast.error(
        error?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại sau.'
      );
    },
  });

  const handleChange = (field) => (event) => {
    const { value } = event.target;

    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.displayName.trim()) {
      nextErrors.displayName = 'Vui lòng nhập tên hiển thị.';
    } else if (form.displayName.length > MAX_LENGTHS.displayName) {
      nextErrors.displayName = 'Tên hiển thị không được vượt quá 120 ký tự.';
    }

    if (form.contactEmail && !validateEmail(form.contactEmail)) {
      nextErrors.contactEmail = 'Email liên hệ không hợp lệ.';
    }

    if (form.phone && !validatePhone(form.phone)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.';
    }

    if (form.phone.length > MAX_LENGTHS.phone) {
      nextErrors.phone = 'Số điện thoại không được vượt quá 30 ký tự.';
    }

    if (form.address.length > MAX_LENGTHS.address) {
      nextErrors.address = 'Địa chỉ không được vượt quá 255 ký tự.';
    }

    if (form.about.length > MAX_LENGTHS.about) {
      nextErrors.about = 'Phần giới thiệu không được vượt quá 1000 ký tự.';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    updateMutation.mutate({
      displayName: form.displayName.trim(),
      contactEmail: form.contactEmail.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      about: form.about.trim(),
    });
  };

  const handleReset = () => {
    if (!profile) return;

    setForm({
      displayName: normalizeValue(profile.displayName),
      contactEmail: normalizeValue(profile.contactEmail),
      phone: normalizeValue(profile.phone),
      address: normalizeValue(profile.address),
      about: normalizeValue(profile.about),
    });
    setFormErrors({});
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="bg-background-secondary border-border-default flex min-h-[320px] items-center justify-center rounded-3xl border p-8 shadow-sm">
          <div className="text-center">
            <div className="border-primary/20 border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4" />
            <p className="text-text-secondary mt-4 text-sm">
              Đang tải hồ sơ...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="space-y-6 py-4">
        <ErrorDisplay
          title="Không tải được hồ sơ organizer"
          message={
            profileQuery.error?.message ||
            'Vui lòng thử tải lại để lấy dữ liệu hồ sơ.'
          }
          onRetry={() => profileQuery.refetch()}
          className="bg-background-secondary"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="bg-background-secondary border-border-default rounded-3xl border p-6 shadow-sm lg:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary rounded-2xl p-3">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-text-primary text-3xl font-black tracking-tight">
              Hồ sơ nhà tổ chức
            </h1>
            <p className="text-text-secondary mt-2 text-sm leading-6">
              Cập nhật thông tin liên hệ và giới thiệu ngắn.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-background-secondary border-border-default rounded-3xl border p-6 shadow-sm lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-text-primary text-xl font-bold">
              Thông tin liên hệ
            </h2>
            <p className="text-text-secondary text-sm">
              Email đăng ký giữ nguyên, chỉ chỉnh thông tin hiển thị.
            </p>
          </div>

          <div className="bg-background-primary text-text-secondary rounded-2xl px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <Mail className="h-4 w-4" />
              Email đăng ký:
            </span>{' '}
            <span className="text-text-primary font-medium">
              {profile?.registeredEmail || authUser?.email || 'Chưa có'}
            </span>
          </div>

          <FloatingLabelInput
            id="displayName"
            label="Tên hiển thị"
            value={form.displayName}
            onChange={handleChange('displayName')}
            error={formErrors.displayName}
            disabled={updateMutation.isPending}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FloatingLabelInput
              id="contactEmail"
              label="Email liên hệ"
              type="email"
              value={form.contactEmail}
              onChange={handleChange('contactEmail')}
              error={formErrors.contactEmail}
              disabled={updateMutation.isPending}
            />

            <FloatingLabelInput
              id="phone"
              label="Số điện thoại"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              error={formErrors.phone}
              disabled={updateMutation.isPending}
            />
          </div>

          <FloatingLabelInput
            id="address"
            label="Địa chỉ"
            value={form.address}
            onChange={handleChange('address')}
            error={formErrors.address}
            disabled={updateMutation.isPending}
          />

          <div>
            <label
              htmlFor="about"
              className="text-text-secondary mb-2 block text-sm font-medium"
            >
              Giới thiệu
            </label>
            <textarea
              id="about"
              value={form.about}
              onChange={handleChange('about')}
              disabled={updateMutation.isPending}
              rows={7}
              className={`bg-background-secondary text-text-primary placeholder-text-placeholder block w-full rounded-lg border p-3 transition outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-80 ${
                formErrors.about
                  ? 'border-destructive'
                  : 'border-border-default'
              }`}
              placeholder="Giới thiệu ngắn về organizer..."
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              {formErrors.about ? (
                <p className="text-destructive text-xs">{formErrors.about}</p>
              ) : (
                <p className="text-text-secondary text-xs">
                  Tối đa {MAX_LENGTHS.about} ký tự.
                </p>
              )}
              <p className="text-text-secondary text-xs">
                {form.about.length}/{MAX_LENGTHS.about}
              </p>
            </div>
          </div>

          <div className="border-border-default flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={updateMutation.isPending || !hasUnsavedChanges}
              className="sm:min-w-28"
            >
              Hủy thay đổi
            </Button>
            <Button
              type="submit"
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending || !hasUnsavedChanges}
              className="sm:min-w-36"
            >
              <Save className="mr-2 h-4 w-4" />
              Lưu hồ sơ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerProfilePage;
