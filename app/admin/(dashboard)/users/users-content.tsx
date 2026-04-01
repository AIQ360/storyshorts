"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Loader2,
  Trash2,
  CreditCard,
  Pencil,
  Box,
  ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { FAKE_USERS } from "../components/fake-data";

const ITEMS_PER_PAGE = 10;

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  credits: number;
  spent: number;
  models: number;
  images: number;
  created_at: string;
};

type SortField =
  | "email"
  | "credits"
  | "spent"
  | "models"
  | "images"
  | "created_at";
type SortDir = "asc" | "desc";

export default function UsersContent({
  isTestAdmin = false,
}: {
  isTestAdmin?: boolean;
}) {
  const [users, setUsers] = useState<UserRow[]>(isTestAdmin ? FAKE_USERS : []);
  const [isLoading, setIsLoading] = useState(!isTestAdmin);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [creditEditUser, setCreditEditUser] = useState<UserRow | null>(null);
  const [creditEditValue, setCreditEditValue] = useState("");
  const [isCreditSaving, setIsCreditSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isTestAdmin) fetchUsers();
  }, [isTestAdmin]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = users
    .filter(
      (u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp =
        typeof aVal === "string"
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
      setDeleteUser(null);
    }
  };

  const handleCreditSave = async () => {
    if (!creditEditUser) return;
    const newCredits = parseInt(creditEditValue);
    if (isNaN(newCredits) || newCredits < 0) {
      toast.error("Credits must be a non-negative number");
      return;
    }

    setIsCreditSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: creditEditUser.id,
          credits: newCredits,
        }),
      });
      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u.id === creditEditUser.id ? { ...u, credits: newCredits } : u,
        ),
      );
      toast.success("Credits updated");
    } catch {
      toast.error("Failed to update credits");
    } finally {
      setIsCreditSaving(false);
      setCreditEditUser(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-30" />
      );
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-black">Manage Users</h2>
        <p className="text-muted-foreground mt-1">
          View and manage all registered users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: Users,
            color: "blue",
          },
          {
            label: "Total Credits",
            value: users.reduce((s, u) => s + u.credits, 0),
            icon: CreditCard,
            color: "emerald",
          },
          {
            label: "Total Spent",
            value: `$${users.reduce((s, u) => s + u.spent, 0).toFixed(2)}`,
            icon: CreditCard,
            color: "amber",
          },
          {
            label: "Total Models",
            value: users.reduce((s, u) => s + u.models, 0),
            icon: Box,
            color: "violet",
          },
          {
            label: "Total Images",
            value: users.reduce((s, u) => s + u.images, 0),
            icon: ImageIcon,
            color: "pink",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {stat.label}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-black">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full border-gray-200/60 h-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Loading users...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "No users match your search" : "No users yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  {(
                    [
                      {
                        field: "email" as SortField,
                        label: "User",
                        alwaysShow: true,
                      },
                      {
                        field: "credits" as SortField,
                        label: "Credits",
                        alwaysShow: true,
                      },
                      {
                        field: "spent" as SortField,
                        label: "Spent",
                        alwaysShow: false,
                      },
                      {
                        field: "models" as SortField,
                        label: "Models",
                        alwaysShow: false,
                      },
                      {
                        field: "images" as SortField,
                        label: "Images",
                        alwaysShow: false,
                      },
                      {
                        field: "created_at" as SortField,
                        label: "Joined",
                        alwaysShow: false,
                      },
                    ] as const
                  ).map((col) => (
                    <th
                      key={col.field}
                      className={`px-3 sm:px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-black transition-colors group ${!col.alwaysShow ? "hidden md:table-cell" : ""}`}
                      onClick={() => handleSort(col.field)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <SortIcon field={col.field} />
                      </div>
                    </th>
                  ))}
                  <th className="px-3 sm:px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="font-medium text-black truncate">
                          {user.full_name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3.5">
                      <span className="text-black font-medium">
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      ${user.spent.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {user.models}
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {user.images}
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-black hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={isTestAdmin}
                          onClick={() => {
                            setCreditEditUser(user);
                            setCreditEditValue(user.credits.toString());
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={isTestAdmin}
                          onClick={() => setDeleteUser(user)}
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} users
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {getPageNumbers().map((page, i) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteUser !== null}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-black">
                {deleteUser?.email}
              </span>{" "}
              and all their data (models, images, credits). This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credit Edit Dialog */}
      <AlertDialog
        open={creditEditUser !== null}
        onOpenChange={(open) => !open && setCreditEditUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adjust Credits</AlertDialogTitle>
            <AlertDialogDescription>
              Update credits for{" "}
              <span className="font-semibold text-black">
                {creditEditUser?.email}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              type="number"
              min="0"
              value={creditEditValue}
              onChange={(e) => setCreditEditValue(e.target.value)}
              className="h-11 rounded-xl border-gray-200/60"
              placeholder="Enter credits"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreditSaving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreditSave}
              disabled={isCreditSaving}
              className="bg-[#0025cc] hover:bg-[#0025cc]/90"
            >
              {isCreditSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Credits"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
