import { useNotifications, Message } from "@/hooks/use-notifications";
import { useLocation } from "wouter";
import { MessageSquare, CheckCheck, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MessagesDropdown() {
  const { 
    messages, 
    unreadMessagesCount, 
    markMessageAsRead, 
    markAllMessagesAsRead, 
    isLoading 
  } = useNotifications();
  const [, setLocation] = useLocation();
  
  const handleMessageClick = (message: Message) => {
    if (!message.read) {
      markMessageAsRead(message.id);
    }
    
    // Navigate to communications center
    setLocation('/communication-center');
  };
  
  const handleViewAllClick = () => {
    setLocation('/communication-center');
  };
  
  // Show only the 5 most recent messages
  const recentMessages = Array.isArray(messages) && messages.length > 0 
    ? messages.slice(0, 5) 
    : [];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-[1.2rem] w-[1.2rem]" />
          {unreadMessagesCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center p-0">
              {unreadMessagesCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Messages</span>
          {unreadMessagesCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1 px-2"
              onClick={() => markAllMessagesAsRead()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start cursor-default py-2">
                  <div className="flex w-full items-start gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-1" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          ) : recentMessages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No messages yet</p>
            </div>
          ) : (
            <>
              {recentMessages.map((message) => (
                <DropdownMenuItem 
                  key={message.id}
                  className={`flex flex-col items-start cursor-pointer py-2 ${!message.read ? 'bg-accent/10' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex w-full items-start gap-2">
                    <Avatar className="h-8 w-8">
                      {message.sender.avatar ? (
                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className={`text-sm ${!message.read ? 'font-medium' : ''}`}>{message.sender.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                    </div>
                    {message.urgent && <Badge variant="destructive" className="text-xs h-4 px-1">Urgent</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 w-full flex justify-between">
                    <span>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                    {!message.read && (
                      <Badge variant="outline" className="text-xs h-4 px-1">New</Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="outline" className="w-full text-center" onClick={handleViewAllClick}>
            View all messages
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}