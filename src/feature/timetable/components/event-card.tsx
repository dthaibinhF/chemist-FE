import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  MapPin, 
  User, 
  Video, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink 
} from "lucide-react";

import type { CalendarEvent } from "../types/timetable.types";
import { PermissionGuard, AdminOnly } from "./permission-guard";
import { 
  formatTime, 
  getEventDuration, 
  isEventActive 
} from "../utils/calendar-utils";

interface EventCardProps {
  event: CalendarEvent;
  variant?: "compact" | "detailed";
  onClick?: (event: CalendarEvent) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  showActions?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = "compact",
  onClick,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event);
    }
  };

  const handleMeetingLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.meeting_link) {
      window.open(event.meeting_link, '_blank');
    }
  };

  const isActive = isEventActive(event);

  if (variant === "compact") {
    return (
      <div
        className={`p-2 rounded-md cursor-pointer transition-all hover:shadow-md ${
          event.color
        } ${
          isActive ? 'ring-2 ring-green-400 shadow-lg' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-sm truncate flex-1">
            {event.group_name}
          </div>
          {showActions && (
            <PermissionGuard permissions={['canEdit', 'canDelete']}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PermissionGuard schedule={event} schedulePermission="canEdit">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <AdminOnly>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </AdminOnly>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGuard>
          )}
        </div>
        
        <div className="flex items-center text-xs mb-1">
          <Clock className="w-3 h-3 mr-1" />
          <span>
            {formatTime(event.start)} - {formatTime(event.end)}
          </span>
          <span className="ml-auto text-xs opacity-75">
            ({getEventDuration(event)})
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate">{event.teacher_name}</span>
          </div>
          <div className="flex items-center text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{event.room_name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs px-1 py-0.5 rounded ${
            event.delivery_mode === 'ONLINE' 
              ? 'bg-green-100 text-green-800' 
              : event.delivery_mode === 'HYBRID'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {event.delivery_mode === 'ONLINE' ? 'Online' : 
             event.delivery_mode === 'HYBRID' ? 'Hybrid' : 'Offline'}
          </span>

          {event.meeting_link && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={handleMeetingLink}
            >
              <Video className="w-3 h-3" />
            </Button>
          )}
        </div>

        {isActive && (
          <div className="flex items-center justify-center mt-2 pt-2 border-t border-green-200">
            <span className="text-xs text-green-700 font-medium flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Đang diễn ra
            </span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md group ${
        event.color
      } ${
        isActive ? 'ring-2 ring-green-400 shadow-lg' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {event.group_name}
          </h3>
          <div className="flex items-center text-sm mt-1">
            <Clock className="w-4 h-4 mr-1" />
            <span>
              {formatTime(event.start)} - {formatTime(event.end)}
            </span>
            <span className="ml-2 text-sm opacity-75">
              ({getEventDuration(event)})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isActive && (
            <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Đang diễn ra
            </span>
          )}
          <span className={`text-sm px-2 py-1 rounded ${
            event.delivery_mode === 'ONLINE' 
              ? 'bg-green-100 text-green-800' 
              : event.delivery_mode === 'HYBRID'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {event.delivery_mode === 'ONLINE' ? 'Trực tuyến' : 
             event.delivery_mode === 'HYBRID' ? 'Kết hợp' : 'Trực tiếp'}
          </span>

          {showActions && (
            <PermissionGuard permissions={['canEdit', 'canDelete']}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PermissionGuard schedule={event} schedulePermission="canEdit">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <AdminOnly>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </AdminOnly>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGuard>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <span className="font-medium">Giáo viên:</span>
            <span className="ml-1">{event.teacher_name}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span className="font-medium">Phòng học:</span>
            <span className="ml-1">{event.room_name}</span>
          </div>
        </div>

        {event.meeting_link && (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMeetingLink}
              className="flex items-center"
            >
              <Video className="w-4 h-4 mr-1" />
              Tham gia meeting
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};