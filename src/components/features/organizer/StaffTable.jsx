import React from 'react';
import {
  Edit,
  Trash2,
  KeyRound,
  User,
  Mail,
  Calendar as CalendarIcon,
} from 'lucide-react';
import Button from '../../ui/Button';

export default function StaffTable({
  staffList,
  onEdit,
  onDelete,
  onAssignEvents,
}) {
  if (staffList.length === 0) {
    return (
      <div className="border-border-default bg-background-secondary flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="bg-background-primary mb-4 rounded-full p-4">
          <User className="text-text-secondary h-8 w-8" />
        </div>
        <h3 className="text-text-primary mb-1 text-lg font-semibold">
          Chưa có nhân viên nào
        </h3>
        <p className="text-text-secondary text-sm">
          Tạo tài khoản nhân viên để bắt đầu phân quyền
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {staffList.map((staff) => (
        <div
          key={staff.id}
          className="border-border-default bg-background-secondary group rounded-lg border p-5 transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            {/* Left Section - Staff Info */}
            <div className="flex flex-1 items-start gap-4">
              {/* Avatar */}
              <div className="bg-primary/10 text-primary flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold">
                {staff.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-text-primary group-hover:text-primary mb-2 text-lg font-semibold transition-colors">
                  {staff.fullName || 'Chưa cập nhật'}
                </h3>

                <div className="space-y-1.5">
                  <div className="text-text-secondary flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>

                  <div className="text-text-secondary flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Được phân quyền:{' '}
                      <span className="text-text-primary font-semibold">
                        {staff.eventsAssigned || 0}
                      </span>{' '}
                      sự kiện
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
              <button
                size="sm"
                onClick={() => onAssignEvents(staff)}
                className="text-text-secondary hover:bg-success/10 hover:text-success rounded-lg p-2 transition-colors"
              >
                <KeyRound className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(staff)}
                  className="text-text-secondary hover:bg-primary/10 hover:text-primary rounded-lg p-2 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(staff)}
                  className="text-text-secondary hover:bg-destructive/10 hover:text-destructive rounded-lg p-2 transition-colors"
                  title="Xóa nhân viên"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
