import React, { useState, useRef } from 'react';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Shield, UserCheck, Search, AlertCircle, Crown, User, Mail, Sparkles, Camera, Upload, X } from 'lucide-react';
import { formatRole, canManageUsers } from '@/lib/rbac';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ROLE_COLORS = {
  super_user: 'from-emerald-400 to-teal-500',
  admin: 'from-blue-400 to-indigo-500',
  standard_user: 'from-slate-400 to-gray-500',
};

const ROLE_ICONS = {
  super_user: Crown,
  admin: Shield,
  standard_user: User,
};

function ProfilePictureUpload({ user, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result;
          if (!base64) return;

          const binaryString = atob(base64.split(',')[1]);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const fileBlob = new Blob([bytes], { type: file.type });
          const uploadFile = new File([fileBlob], file.name, { type: file.type });

          const { file_url } = await platform.integrations.Core.UploadFile({ file: uploadFile });
          
          await platform.entities.User.update(user.id, { profile_photo_url: file_url });
          onUpdate({ ...user, profile_photo_url: file_url });
          toast.success('Profile picture updated');
        } catch (error) {
          toast.error('Failed to upload image: ' + error.message);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await platform.entities.User.update(user.id, { profile_photo_url: null });
      onUpdate({ ...user, profile_photo_url: null });
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error('Failed to remove picture');
    }
  };

  return (
    <div className="relative group">
      {(() => {
        const RoleIcon = ROLE_ICONS[user.role] || User;
        return (
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center">
            {user.profile_photo_url ? (
              <img 
                src={user.profile_photo_url} 
                alt={user.full_name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <RoleIcon className="w-7 h-7 text-white" />
            )}
          </div>
        );
      })()}
      
      {/* Upload overlay */}
      <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer">
        <Camera className="w-5 h-5 text-white" />
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      
      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#B87333] hover:bg-[#a06428] flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
        title="Upload profile picture"
      >
        {uploading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {/* Remove button */}
      {user.profile_photo_url && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors z-10"
          title="Remove profile picture"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const allUsers = await platform.entities.User.list();
      return allUsers;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => platform.auth.me(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      await platform.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + error.message);
    },
  });

  const handleRoleChange = (userId, newRole) => {
    if (!canManageUsers(currentUser)) {
      toast.error('Only Super users can manage user roles');
      return;
    }
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handleUserUpdate = (updatedUser) => {
    queryClient.setQueryData(['users'], (old) => 
      old?.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  const filteredUsers = users?.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B87333]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#B87333]/15 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card-light rounded-3xl p-8 border border-[#B87333]/20 shadow-xl backdrop-blur-xl bg-white/60"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1A1208] font-heading">User Management</h1>
            <p className="text-black/60 mt-1 text-sm">Manage team access and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#B87333]/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B87333]" />
                <span className="text-sm font-semibold text-[#1A1208]">{users?.length || 0}</span>
                <span className="text-xs text-black/50">members</span>
              </div>
            </div>
            {canManageUsers(currentUser) && (
              <div className="px-4 py-2 rounded-xl bg-emerald-100/70 backdrop-blur-sm border border-emerald-300/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Admin</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Permission warning */}
      {!canManageUsers(currentUser) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card-light rounded-2xl p-5 border border-amber-300/50 bg-amber-50/70 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Limited Access</h3>
                <p className="text-sm text-amber-700/80">
                  Only Super users can change user roles. Your current role:{' '}
                  <strong className="text-amber-900">{formatRole(currentUser?.role)}</strong>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="glass-card-light rounded-2xl flex items-center border border-[#B87333]/20 backdrop-blur-xl bg-white/60">
          <Search className="ml-4 w-5 h-5 text-black/40" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-0 text-[#1A1208] placeholder:text-black/40 focus:ring-0 focus-visible:ring-0 h-14"
          />
        </div>
      </motion.div>

      {/* Users grid */}
      <div className="grid gap-4">
        {filteredUsers.map((user, index) => {
          const UserProfileIcon = ROLE_ICONS[user.role] || User;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="group glass-card-light rounded-2xl p-6 border border-[#B87333]/15 backdrop-blur-xl bg-white/60 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Profile Picture with Upload - uses internal logic */}
                  <ProfilePictureUpload user={user} onUpdate={handleUserUpdate} />

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#1A1208] truncate">{user.full_name || 'Unknown'}</h3>
                      {user.id === currentUser?.id && (
                        <Badge className="bg-[#B87333]/20 text-[#1A1208] border border-[#B87333]/40 text-xs backdrop-blur-sm">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black/60">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role selector */}
                <div className="flex items-center gap-4">
                  <Badge
                    className={`px-4 py-2 text-sm font-semibold bg-gradient-to-r ${ROLE_COLORS[user.role] || ROLE_COLORS.standard_user} text-white border-0 shadow-lg backdrop-blur-sm`}
                  >
                    {formatRole(user.role)}
                  </Badge>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={!canManageUsers(currentUser) || user.id === currentUser?.id}
                  >
                    <SelectTrigger className="w-44 h-11 bg-white/70 backdrop-blur-sm border border-[#B87333]/30 hover:border-[#B87333]/50 transition-colors text-[#1A1208]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/95">
                      <SelectItem value="super_user" className="font-semibold">
                        <span className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-emerald-600" />
                          Super user
                        </span>
                      </SelectItem>
                      <SelectItem value="admin" className="font-semibold">
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          Admin
                        </span>
                      </SelectItem>
                      <SelectItem value="standard_user" className="font-semibold">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-600" />
                          Standard user
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card-light rounded-2xl p-12 text-center border border-[#B87333]/15 backdrop-blur-xl bg-white/60"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#B87333]/10 backdrop-blur-sm flex items-center justify-center border border-[#B87333]/20">
              <UserCheck className="w-10 h-10 text-[#B87333]/50" />
            </div>
            <p className="text-lg font-semibold text-[#1A1208]">No users found</p>
            <p className="text-sm text-black/50 mt-1">Try a different search term</p>
          </motion.div>
        )}
      </div>

      {/* Role permissions card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card-light rounded-2xl p-6 border border-[#B87333]/20 backdrop-blur-xl bg-white/60 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1208]">Role Permissions</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5 border border-emerald-300/50 bg-emerald-50/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg"></div>
              <h4 className="font-bold text-[#1A1208]">Super user</h4>
            </div>
            <ul className="space-y-2 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                Full access to all features and settings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                View all financial data and reports
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                Manage user roles and permissions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                Company-wide record access
              </li>
            </ul>
          </div>
          <div className="rounded-xl p-5 border border-blue-300/50 bg-blue-50/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-lg"></div>
              <h4 className="font-bold text-[#1A1208]">Standard user</h4>
            </div>
            <ul className="space-y-2 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                Dashboard with operational data
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                CRM (own records only)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                Quotes, invoices, documents
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                No access to reports or settings
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}