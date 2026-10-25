import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, AlertCircle, Info, Check, Eye, Trash2 } from 'lucide-react';

export function Notifications() {
  const { user } = useAuth();
  const { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useDb();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = user ? getUserNotifications(user.id) : [];
  const filteredNotifications = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  const handleView = (notification: any) => {
    markNotificationAsRead(notification.id);
    if (user?.role === 'student') {
      navigate('/student/history');
    } else {
      navigate('/instructor/requests');
    }
  };

  return (
    <div className="max-w-[1200px] w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">
            Notification <span className="text-yellow-600">Center</span>
          </h1>
          <p className="text-sky-900/75 text-[15px] font-medium">Stay updated with clearance approvals, signature requests, and instructor remarks.</p>
        </div>

        {user && notifications.some(n => !n.isRead) && (
          <button
            onClick={() => markAllNotificationsAsRead(user.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 text-yellow-950 text-xs font-black rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Check className="w-4 h-4 text-yellow-950" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-yellow-400 text-yellow-950 border border-yellow-500 shadow-xs'
              : 'bg-white/90 text-sky-900 hover:bg-sky-100 border-2 border-sky-200'
          }`}
        >
          View All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
            filter === 'unread'
              ? 'bg-yellow-400 text-yellow-950 border border-yellow-500 shadow-xs'
              : 'bg-white/90 text-sky-900 hover:bg-sky-100 border-2 border-sky-200'
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white/90 p-12 text-center text-sky-800/60 rounded-3xl border-2 border-sky-200 text-sm font-medium">
            <Bell className="w-10 h-10 mx-auto mb-2 text-yellow-500 opacity-60" />
            No notifications available.
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isSuccess = notif.type === 'success';
            const isError = notif.type === 'error';

            return (
              <div
                key={notif.id}
                className={`rounded-2xl border-2 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs ${
                  notif.isRead 
                    ? 'border-sky-200 bg-white/90 opacity-90' 
                    : 'border-yellow-400 bg-yellow-50/50 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                    isSuccess ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    isError ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-yellow-100 text-yellow-900 border border-yellow-300'
                  }`}>
                    {isSuccess ? <CheckCircle className="w-5 h-5" /> :
                     isError ? <AlertCircle className="w-5 h-5" /> :
                     <Info className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sky-950 text-sm">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block border border-yellow-600"></span>
                      )}
                    </div>
                    <p className="text-sky-900 font-medium text-xs mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[11px] text-sky-700 font-bold mt-1 block">
                      {new Date(notif.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="px-3 py-1.5 text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-xl transition-colors flex items-center gap-1 border border-sky-200"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => handleView(notif)}
                    className="px-3 py-1.5 text-xs font-black text-yellow-950 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
