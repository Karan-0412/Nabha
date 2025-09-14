import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Search, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ensureRoom, getMessagesForRoom, addMessage, onMessagesUpdate, ChatRoom as StoredRoom, MessageRecord } from '@/store/messageStore';
import { useUserContext } from '@/context/user-role';

const ChatPage = () => {
  const { t } = useTranslation();
  const { userRole } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialRoom = params.get('room') || 'ai-assistant';

  const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom);
  const [rooms, setRooms] = useState<StoredRoom[]>(() => getStoredRooms());
  const [messages, setMessages] = useState<MessageRecord[]>(() => getMessagesForRoom(initialRoom));
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  function getStoredRooms() {
    try {
      return (window.localStorage.getItem('telemed-messages-v1') ? JSON.parse(window.localStorage.getItem('telemed-messages-v1') as string).rooms : []) as StoredRoom[];
    } catch {
      return [];
    }
  }

  useEffect(() => {
    setRooms(getStoredRooms());
    const unsub = onMessagesUpdate(() => {
      setRooms(getStoredRooms());
      setMessages(getMessagesForRoom(selectedRoom));
    });
    return () => unsub();
  }, [selectedRoom]);

  useEffect(() => {
    // react to query param changes
    setSelectedRoom(initialRoom);
    setMessages(getMessagesForRoom(initialRoom));
  }, [initialRoom]);

  const chatRooms = useMemo(() => {
    const base: any[] = [
      { id: 'ai-assistant', name: 'AI Health Assistant', type: 'ai', lastMessage: 'Hello! How can I help you today?', timestamp: 'now', unreadCount: 0 },
    ];
    return base.concat(rooms.map(r => ({ id: r.id, name: r.name, type: r.type, lastMessage: '', timestamp: '', unreadCount: 0 })));
  }, [rooms]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const sender = userRole === 'doctor' ? 'doctor' : userRole === 'patient' ? 'patient' : 'system';
    addMessage(selectedRoom, sender as any, inputValue.trim());
    setMessages(getMessagesForRoom(selectedRoom));
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentRoom = chatRooms.find(room => room.id === selectedRoom);

  return (
    <div className="h-full flex">
      {/* Chat Rooms List */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('chat', 'Chat')}</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('searchChats', 'Search chats...')}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room.id);
                  navigate(`/chat?room=${encodeURIComponent(room.id)}`);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedRoom === room.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={''} />
                    <AvatarFallback className={room.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                      {room.type === 'ai' ? <Bot className="h-5 w-5" /> : room.name.split(' ').map((n:any) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{room.name}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">{room.timestamp}</span>
                        {room.unreadCount > 0 && (
                          <Badge className="h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{room.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={''} />
              <AvatarFallback className={currentRoom?.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                {currentRoom?.type === 'ai' ? <Bot className="h-5 w-5" /> : (currentRoom?.name || '').split(' ').map((n:any)=>n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{currentRoom?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {currentRoom?.type === 'ai' ? 'AI Assistant - Always available' : 'Doctor - Typically responds within 2 hours'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'patient' || message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[70%] ${
                  message.sender === 'patient' || message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={
                      message.sender === 'patient' || message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.sender === 'assistant' || message.sender === 'system'
                        ? 'bg-secondary'
                        : 'bg-muted'
                    }>
                      {message.sender === 'patient' || message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.sender === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        'Dr'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'patient' || message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'patient' || message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex items-end space-x-2">
            <Input
              placeholder={t('typeMessage', 'Type your message...')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
