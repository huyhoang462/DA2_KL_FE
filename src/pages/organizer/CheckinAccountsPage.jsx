import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import ConfirmModal from '../../components/ui/ConfirmModal';
import StaffTable from '../../components/features/organizer/StaffTable';
import StaffFormModal from '../../components/features/organizer/StaffFormModal';
import AssignEventsModal from '../../components/features/organizer/AssignEventsModal';
// import { toast } from 'react-hot-toast'; // Thư viện thông báo

export default function CheckinAccountsPage() {
  const queryClient = useQueryClient();

  // State để quản lý modals và dữ liệu đang được chỉnh sửa
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // null: tạo mới, object: sửa
  const [assigningStaff, setAssigningStaff] = useState(null); // Nhân viên đang được gán event
  const [deletingStaff, setDeletingStaff] = useState(null); // Nhân viên đang được xóa

  // 1. Fetch danh sách nhân viên
  const {
    data: staffList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['myStaff'],
    queryFn: userService.getMyStaff,
  });

  // 2. Mutation để TẠO nhân viên
  const createStaffMutation = useMutation({
    mutationFn: userService.createStaff,
    onSuccess: () => {
      // toast.success('Tạo tài khoản nhân viên thành công!');
      queryClient.invalidateQueries(['myStaff']); // Fetch lại danh sách
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      // toast.error(err.message || 'Tạo tài khoản thất bại.');
    },
  });

  // 3. Mutation để CẬP NHẬT nhân viên
  const updateStaffMutation = useMutation({
    mutationFn: ({ staffId, data }) => userService.updateStaff(staffId, data),
    onSuccess: () => {
      // toast.success('Cập nhật thành công!');
      queryClient.invalidateQueries(['myStaff']);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      // toast.error(err.message || 'Cập nhật thất bại.');
    },
  });

  // 4. Mutation để XÓA nhân viên
  const deleteStaffMutation = useMutation({
    mutationFn: userService.deleteStaff,
    onSuccess: () => {
      // toast.success('Xóa tài khoản thành công!');
      queryClient.invalidateQueries(['myStaff']);
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
    },
    onError: (err) => {
      // toast.error(err.message || 'Xóa tài khoản thất bại.');
    },
  });

  // --- Các hàm xử lý sự kiện ---
  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (staff) => {
    setDeletingStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingStaff) {
      deleteStaffMutation.mutate(deletingStaff.id);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingStaff(null);
  };

  const handleOpenAssignModal = (staff) => {
    setAssigningStaff(staff);
    setIsAssignModalOpen(true);
  };

  const handleSaveStaff = (formData) => {
    if (editingStaff) {
      // Chế độ sửa
      updateStaffMutation.mutate({ staffId: editingStaff.id, data: formData });
    } else {
      // Chế độ tạo mới
      createStaffMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">
            Quản lý nhân viên Check-in
          </h1>
          <p className="text-text-secondary text-sm">
            Tạo và quản lý các tài khoản cho nhân viên của bạn.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo tài khoản
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <ErrorDisplay message={error.message} />
      ) : (
        <StaffTable
          staffList={staffList}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onAssignEvents={handleOpenAssignModal}
        />
      )}

      {/* --- MODALS --- */}
      {isFormModalOpen && (
        <StaffFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveStaff}
          initialData={editingStaff}
          isSaving={
            createStaffMutation.isPending || updateStaffMutation.isPending
          }
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xóa tài khoản nhân viên"
        message={
          deletingStaff
            ? `Bạn có chắc chắn muốn xóa tài khoản "${deletingStaff.fullName || deletingStaff.email}"? Hành động này không thể hoàn tác.`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />

      {isAssignModalOpen && (
        <AssignEventsModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          staffMember={assigningStaff}
        />
      )}
    </div>
  );
}
