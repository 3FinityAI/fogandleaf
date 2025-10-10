import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import {
  Search,
  Filter,
  Eye,
  Edit3,
  UserPlus,
  Shield,
  ShieldCheck,
  Ban,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  MapPin,
  Package,
  DollarSign,
} from "lucide-react";

const UserRoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-red-100 text-red-800 border-red-200",
    customer: "bg-blue-100 text-blue-800 border-blue-200",
    moderator: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const roleIcons = {
    admin: ShieldCheck,
    customer: User,
    moderator: Shield,
  };

  const Icon = roleIcons[role] || User;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
        roleStyles[role] || roleStyles.customer
      }`}
    >
      <Icon className="w-3 h-3" />
      {role?.charAt(0).toUpperCase() + role?.slice(1) || "Customer"}
    </span>
  );
};

const UserStatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      isActive
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-red-100 text-red-800 border-red-200"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const UserFilters = ({ filters, onFilterChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchHelp, setShowSearchHelp] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Auto-search as user types (debounced)
    if (e.target.value === "") {
      onSearch("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    onFilterChange({
      role: "",
      status: "",
      search: "",
    });
    onSearch("");
  };

  const hasActiveFilters = filters.role || filters.status || searchTerm;

  return (
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchHelp(true)}
              onBlur={() => setTimeout(() => setShowSearchHelp(false), 200)}
              className="block w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg 
                       bg-white text-secondary-900 placeholder-secondary-500 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       transition-colors duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  onSearch("");
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-secondary-400 hover:text-secondary-600" />
              </button>
            )}

            {/* Search Help Tooltip */}
            {showSearchHelp && searchTerm === "" && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-primary-500" />
                  <h4 className="text-sm font-medium text-secondary-900">
                    Search Tips
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-secondary-700 mb-1">
                      Customer Information:
                    </p>
                    <ul className="text-xs text-secondary-600 space-y-0.5">
                      <li>• Full name or partial name</li>
                      <li>• Email address</li>
                      <li>• Phone number</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-secondary-700 mb-1">
                      Quick Filters:
                    </p>
                    <ul className="text-xs text-secondary-600 space-y-0.5">
                      <li>• Type role (admin, customer)</li>
                      <li>• Status (active, inactive)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-secondary-100">
                  <p className="text-xs text-secondary-500">
                    💡 Press Enter to search or start typing for instant results
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex gap-3">
          <select
            value={filters.role}
            onChange={(e) =>
              onFilterChange({ ...filters, role: e.target.value })
            }
            className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2.5 pr-8 text-sm
                     font-medium text-secondary-700 hover:border-secondary-400 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     transition-colors duration-200 min-w-32"
          >
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="moderator">Moderators</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value })
            }
            className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2.5 pr-8 text-sm
                     font-medium text-secondary-700 hover:border-secondary-400 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     transition-colors duration-200 min-w-32"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 
                       rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 
                       transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}

          <button className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-secondary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-medium text-secondary-700">
                  Active Filters:
                </span>
                <div className="flex gap-2">
                  {filters.role && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-700">
                      Role: {filters.role}
                      <button
                        onClick={() => onFilterChange({ ...filters, role: "" })}
                      >
                        <X className="h-3 w-3 hover:text-primary-900" />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-700">
                      Status: {filters.status}
                      <button
                        onClick={() =>
                          onFilterChange({ ...filters, status: "" })
                        }
                      >
                        <X className="h-3 w-3 hover:text-primary-900" />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-700">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          onSearch("");
                        }}
                      >
                        <X className="h-3 w-3 hover:text-primary-900" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-secondary-500">
                {Object.values(filters).filter((v) => v && v !== "").length +
                  (searchTerm ? 1 : 0)}{" "}
                filters active
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UsersTable = ({ users, onViewUser, onUpdateUser }) => (
  <div className="card">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondary-200">
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              User
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Contact
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Role
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Status
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Orders
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Total Spent
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Joined
            </th>
            <th className="text-left py-4 px-2 text-sm font-medium text-secondary-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="table-row">
              <td className="py-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-secondary-500">
                      ID: {user.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="w-3 h-3 text-secondary-400" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1 text-sm text-secondary-600">
                      <Phone className="w-3 h-3 text-secondary-400" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4 px-2">
                <UserRoleBadge role={user.role} />
              </td>
              <td className="py-4 px-2">
                <UserStatusBadge isActive={user.isActive} />
              </td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-1 text-sm text-secondary-700">
                  <Package className="w-3 h-3 text-secondary-400" />
                  {user.orderCount || 0}
                </div>
              </td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-1 text-sm font-medium text-secondary-900">
                  <DollarSign className="w-3 h-3 text-secondary-400" />
                  {user.totalSpent
                    ? `₹${parseFloat(user.totalSpent).toFixed(2)}`
                    : "₹0.00"}
                </div>
              </td>
              <td className="py-4 px-2 text-sm text-secondary-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewUser(user)}
                    className="p-1 hover:bg-secondary-100 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-secondary-600" />
                  </button>
                  <button
                    onClick={() => onUpdateUser(user)}
                    className="p-1 hover:bg-secondary-100 rounded transition-colors"
                    title="Edit User"
                  >
                    <Edit3 className="w-4 h-4 text-secondary-600" />
                  </button>
                  {user.isActive ? (
                    <button
                      onClick={() => onUpdateUser({ ...user, isActive: false })}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Deactivate User"
                    >
                      <Ban className="w-4 h-4 text-red-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateUser({ ...user, isActive: true })}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                      title="Activate User"
                    >
                      <User className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const UserDetailsModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (user) {
      setEditingUser({ ...user });
    }
  }, [user]);

  const handleSave = async () => {
    if (editingUser) {
      await onUpdate(editingUser);
      onClose();
    }
  };

  if (!isOpen || !user || !editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-secondary-900">
              User Details
            </h2>
            <p className="text-secondary-600">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingUser.firstName || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      firstName: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingUser.lastName || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, lastName: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={editingUser.phone || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, phone: e.target.value })
                  }
                  className="input-field"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={editingUser.role || "customer"}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editingUser.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      isActive: e.target.value === "active",
                    })
                  }
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary-900">
                {user.orderCount || 0}
              </div>
              <div className="text-sm text-secondary-600">Total Orders</div>
            </div>
            <div className="card text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary-900">
                $
                {user.totalSpent
                  ? parseFloat(user.totalSpent).toFixed(2)
                  : "0.00"}
              </div>
              <div className="text-sm text-secondary-600">Total Spent</div>
            </div>
            <div className="card text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary-900">
                {user.createdAt
                  ? Math.floor(
                      (new Date() - new Date(user.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}
              </div>
              <div className="text-sm text-secondary-600">Days Active</div>
            </div>
          </div>

          {/* Address Information */}
          {(user.address || user.city || user.state) && (
            <div className="card">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </h3>
              <div className="space-y-2 text-sm">
                {user.address && (
                  <p>
                    <span className="font-medium">Address:</span> {user.address}
                  </p>
                )}
                {user.city && (
                  <p>
                    <span className="font-medium">City:</span> {user.city}
                  </p>
                )}
                {user.state && (
                  <p>
                    <span className="font-medium">State:</span> {user.state}
                  </p>
                )}
                {user.zipCode && (
                  <p>
                    <span className="font-medium">ZIP:</span> {user.zipCode}
                  </p>
                )}
                {user.country && (
                  <p>
                    <span className="font-medium">Country:</span> {user.country}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchUsers = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...filters,
        search: searchTerm,
      });

      const response = await axiosInstance.get(`/admin/users?${params}`);
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchUsers(1, newFilters.search);
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    fetchUsers(1, searchTerm);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      await axiosInstance.put(`/admin/users/${updatedUser.id}`, updatedUser);
      await fetchUsers(pagination.currentPage, filters.search);
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      setError("Failed to update user");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: "1",
          limit: "20",
        });

        const response = await axiosInstance.get(`/admin/users?${params}`);
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading && users.length === 0) {
    return (
      <Layout
        title="Customer Management"
        subtitle="Manage customer accounts, user roles, and access permissions"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Customer Management"
      subtitle={`Manage ${pagination.totalItems} customer accounts and user roles`}
    >
      <div className="space-y-6">
        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {error ? (
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => fetchUsers()} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <UsersTable
            users={users}
            onViewUser={handleViewUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onUpdate={handleUpdateUser}
      />
    </Layout>
  );
};

export default UsersPage;
