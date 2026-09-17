'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { User, Settings, Bell, LogOut, Utensils, CreditCard, ChevronRight } from 'lucide-react';

type ProfileSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DrawerPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md flex flex-col rounded-t-[32px] bg-white shadow-2xl h-[85vh]">
          
          {/* Khối Header màu tối bao gồm cả thanh kéo và thông tin profile để không bị lộ viền trắng */}
          <div className="bg-slate-900 rounded-t-[32px] rounded-b-[2rem] shadow-sm z-10 shrink-0">
            {/* Thanh kéo vuốt (Drag handle) */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-white opacity-80" />
            </div>

            {/* Profile Info */}
            <div className="p-6 pt-2 pb-8 text-left text-white flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-[#E5F5EF] flex items-center justify-center p-[3px] shadow-sm shrink-0">
                <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center">
                  <User className="h-10 w-10 text-[#E5F5EF]" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Foodie User</h2>
                <p className="text-sm text-slate-300 mt-1">user@finmo.app</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-white -mt-6 pt-6">

            <div className="px-6 py-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Utensils className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Meals Logged</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">128</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Spent</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">$1,240</p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="p-2.5 rounded-full bg-blue-50 text-blue-600">
                      <Settings className="h-5 w-5" />
                    </div>
                    Account Settings
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="p-2.5 rounded-full bg-pink-50 text-pink-600">
                      <Bell className="h-5 w-5" />
                    </div>
                    Notifications
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Logout */}
              <div className="pt-6">
                <button 
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors font-semibold"
                  onClick={() => {
                    onClose();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
