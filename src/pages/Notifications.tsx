import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, User, MessageSquare, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'like':
        return <ThumbsUp className="h-4 w-4 text-purple-500" />;
      case 'invitation':
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  if (!user) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view notifications</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {notifications.some(n => !n.read) && (
              <Button variant="outline" size="sm" onClick={() => markAllAsRead('bell')}>
                Mark all as read
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.link || '#'}
                          onClick={() => markAsRead(notification.id)}
                          className={`block p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/40' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground">{notification.content}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getNotificationIcon(notification.type)}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No notifications to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="unread">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {notifications.filter(n => !n.read).length > 0 ? (
                      notifications.filter(n => !n.read).map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.link || '#'}
                          onClick={() => markAsRead(notification.id)}
                          className="block p-4 hover:bg-muted/50 transition-colors bg-muted/40"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground">{notification.content}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getNotificationIcon(notification.type)}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No unread notifications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {notifications.filter(n => n.type === 'message').length > 0 ? (
                      notifications.filter(n => n.type === 'message').map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.link || '#'}
                          onClick={() => markAsRead(notification.id)}
                          className={`block p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/40' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground">{notification.content}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No messages to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Notifications;
