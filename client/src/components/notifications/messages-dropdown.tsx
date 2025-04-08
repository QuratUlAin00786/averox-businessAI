import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { MessageCircle, Check, CheckCheck } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications, Message } from "@/hooks/use-notifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function MessagesDropdown() {
  const [, setLocation] = useLocation();
  const { 
    messages, 
    unreadMessageCount, 
    markMessageAsRead,
    markAllMessagesAsRead,
    isLoading
  } = useNotifications();
  
  const handleMessageClick = (message: Message) => {
    if (!message.read) {
      markMessageAsRead(message.id);
    }
    
    // Navigate to communication center with the sender's conversation open
    setLocation(`/communication-center?contact=${message.sender.id}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="p-1 ml-3 text-neutral-400 hover:text-neutral-500 relative">
          <span className="sr-only">View messages</span>
          <MessageCircle className="w-6 h-6" />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-primary text-white text-xs rounded-full font-semibold">
              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Messages</span>
          {unreadMessageCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllMessagesAsRead()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500">
              No messages to display
            </div>
          ) : (
            <DropdownMenuGroup>
              {messages.map((message) => (
                <DropdownMenuItem
                  key={message.id}
                  className={`cursor-pointer p-3 flex items-start gap-3 ${!message.read ? 'bg-accent/20' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex-shrink-0">
                    <Avatar>
                      {message.sender.avatar ? (
                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {message.sender.name.split(' ').map(part => part[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{message.sender.name}</div>
                      {message.urgent && (
                        <Badge className="ml-1" variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                      {message.content}
                    </p>
                    <div className="flex items-center mt-1 gap-3">
                      <span className="text-xs text-neutral-400">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                      {message.read && (
                        <span className="flex items-center text-xs text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer justify-center text-center text-primary"
          onClick={() => setLocation("/communication-center")}
        >
          Go to Communication Center
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}