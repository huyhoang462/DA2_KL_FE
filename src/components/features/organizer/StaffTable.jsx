import React from 'react';
import { MoreHorizontal, Edit, Trash2, KeyRound } from 'lucide-react';
import Button from '../../ui/Button';

export default function StaffTable({
  staffList,
  onEdit,
  onDelete,
  onAssignEvents,
}) {
  if (staffList.length === 0) {
    return (
      <div className="text-text-secondary bg-background-secondary rounded-lg py-20 text-center">
        Bạn chưa tạo tài khoản nhân viên nào.
      </div>
    );
  }

  return (
    <div className="border-border-default bg-background-secondary overflow-hidden rounded-lg border">
      <table className="divide-border-default min-w-full divide-y">
        <thead className="bg-foreground">
          <tr>
            <th
              scope="col"
              className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Tên nhân viên
            </th>
            <th
              scope="col"
              className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Email
            </th>
            <th
              scope="col"
              className="text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Sự kiện được phân
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Hành động</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-border-default divide-y">
          {staffList.map((staff) => (
            <tr key={staff.id} className="hover:bg-foreground">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-text-primary font-medium">
                  {staff.fullName}
                </div>
              </td>
              <td className="text-text-secondary px-6 py-4 text-sm whitespace-nowrap">
                {staff.email}
              </td>
              <td className="text-text-secondary px-6 py-4 text-sm whitespace-nowrap">
                {staff.assignedEvents?.length || 0} sự kiện
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignEvents(staff)}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Phân quyền
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(staff)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(staff)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
