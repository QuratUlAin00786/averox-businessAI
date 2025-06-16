import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PhoneIncoming, PhoneCall, PhoneOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  callStatus: 'incoming' | 'ongoing' | 'completed' | null;
  contactName: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
}

export function CustomCallDialog({
  isOpen,
  onClose,
  callStatus,
  contactName,
  phoneNumber,
  firstName,
  lastName,
  onAcceptCall,
  onRejectCall,
  onEndCall
}: CustomCallDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Only allow closing the dialog when the call is completed
      if (callStatus !== 'completed') {
        // If trying to close an active call, treat it as rejecting/ending the call
        if (callStatus === 'incoming') {
          onRejectCall();
        } else if (callStatus === 'ongoing') {
          onEndCall();
        }
      } else {
        onClose();
      }
    }
  };

  const getStatusIcon = () => {
    switch (callStatus) {
      case 'incoming':
        return <PhoneIncoming className="h-8 w-8 text-blue-600 animate-pulse" />;
      case 'ongoing':
        return <PhoneCall className="h-8 w-8 text-green-600" />;
      case 'completed':
        return <PhoneOff className="h-8 w-8 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (callStatus) {
      case 'incoming':
        return 'Incoming Call';
      case 'ongoing':
        return 'On Call';
      case 'completed':
        return 'Call Ended';
      default:
        return '';
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onClick={handleOverlayClick}
    >
      <div 
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - only show when call is completed */}
        {callStatus === 'completed' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}

        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {getStatusTitle()}
          </h2>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col items-center py-6 space-y-4">
          <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
            <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
              {firstName?.[0] || contactName?.[0] || '?'}{lastName?.[0] || contactName?.[1] || ''}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-1">
            <h3 className="text-xl font-medium text-gray-900">
              {contactName || 'Unknown Contact'}
            </h3>
            <p className="text-sm text-gray-500">{phoneNumber}</p>
            
            {callStatus === 'ongoing' && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-600 font-medium">
                  Call in progress...
                </p>
              </div>
            )}
            
            {callStatus === 'completed' && (
              <p className="text-sm text-gray-500 mt-2">
                Call has ended
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 pb-8">
          {callStatus === 'incoming' && (
            <>
              {/* Reject Call Button */}
              <button
                onClick={onRejectCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <PhoneOff className="h-7 w-7 text-white" />
              </button>

              {/* Accept Call Button */}
              <button
                onClick={onAcceptCall}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 animate-pulse"
              >
                <PhoneCall className="h-7 w-7 text-white" />
              </button>
            </>
          )}

          {callStatus === 'ongoing' && (
            <button
              onClick={onEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <PhoneOff className="h-7 w-7 text-white" />
            </button>
          )}

          {callStatus === 'completed' && (
            <Button
              onClick={onClose}
              className="px-8 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}