import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import type { TAccount, TRole } from "@/feature/auth/types/auth.type";
import { getAllAccounts, registerAccount, deleteAccount, deactivateAccount, reactivateAccount } from "@/service/account.service";
import { getAllRoles } from "@/feature/auth/services/roleManagementApi";

const createUserSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role_ids: z.array(z.number()).min(1, "Phải chọn ít nhất một vai trò"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const UserManagement = () => {
  const [accounts, setAccounts] = useState<TAccount[]>([]);
  const [roles, setRoles] = useState<TRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role_ids: [],
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, rolesData] = await Promise.all([
        getAllAccounts(),
        getAllRoles(),
      ]);
      setAccounts(accountsData);
      setRoles(rolesData);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreateUser = async (data: CreateUserFormData) => {
    try {
      await registerAccount(data);
      toast.success("Tạo tài khoản thành công");
      setCreateDialogOpen(false);
      form.reset();
      loadData();
    } catch (error) {
      toast.error("Lỗi khi tạo tài khoản");
      console.error("Error creating user:", error);
    }
  };

  const handleDeleteUser = async (accountId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    try {
      await deleteAccount(accountId);
      toast.success("Xóa tài khoản thành công");
      loadData();
    } catch (error) {
      toast.error("Lỗi khi xóa tài khoản");
      console.error("Error deleting user:", error);
    }
  };

  const handleDeactivateUser = async (accountId: number) => {
    try {
      await deactivateAccount(accountId);
      toast.success("Vô hiệu hóa tài khoản thành công");
      loadData();
    } catch (error) {
      toast.error("Lỗi khi vô hiệu hóa tài khoản");
      console.error("Error deactivating user:", error);
    }
  };

  const handleReactivateUser = async (accountId: number) => {
    try {
      await reactivateAccount(accountId);
      toast.success("Kích hoạt lại tài khoản thành công");
      loadData();
    } catch (error) {
      toast.error("Lỗi khi kích hoạt lại tài khoản");
      console.error("Error reactivating user:", error);
    }
  };

  const columns: ColumnDef<TAccount>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
    },
    {
      accessorKey: "role_names",
      header: "Vai trò",
      cell: ({ row }) => {
        const roleNames = row.original.role_names || [];
        return (
          <div className="flex flex-wrap gap-1">
            {roleNames.map((roleName, index) => (
              <Badge key={index} variant="secondary">
                {roleName}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "deactivateAt",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = !row.original.deactivateAt;
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const account = row.original;
        const isActive = !account.deactivateAt;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {isActive ? (
                <DropdownMenuItem
                  onClick={() => handleDeactivateUser(account.id)}
                  className="text-yellow-600"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Vô hiệu hóa
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleReactivateUser(account.id)}
                  className="text-green-600"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Kích hoạt lại
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDeleteUser(account.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];


  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        filterColumn="name"
        filterPlaceholder="Tìm kiếm theo tên..."
        ComponentForCreate={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo tài khoản
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tạo tài khoản mới</DialogTitle>
                <DialogDescription>
                  Tạo tài khoản người dùng mới với vai trò được chỉ định.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateUser)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập email..." type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập mật khẩu..." type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {roles.map((role) => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`role-${role.id}`}
                                  checked={field.value.includes(role.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, role.id]);
                                    } else {
                                      field.onChange(field.value.filter((id: number) => id !== role.id));
                                    }
                                  }}
                                />
                                <label htmlFor={`role-${role.id}`} className="text-sm font-medium">
                                  {role.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />
    </div>
  );
};

export default UserManagement;