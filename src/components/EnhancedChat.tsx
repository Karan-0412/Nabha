import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'doctor' | 'ai';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface EnhancedChatProps {
  userRole: 'patient' | 'doctor';
}

const EnhancedChat = ({ userRole }: EnhancedChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: userRole === 'patient' ? 'doctor' : 'ai',
      timestamp: new Date(Date.now() - 300000),
      status: 'read'
    },
    {
      id: '2', 
      text: 'I have been experiencing some chest pain recently.',
      sender: 'user',
      timestamp: new Date(Date.now() - 240000),
      status: 'read'
    },
    {
      id: '3',
      text: 'I understand your concern. Can you describe the pain? Is it sharp, dull, or crushing?',
      sender: userRole === 'patient' ? 'doctor' : 'ai',
      timestamp: new Date(Date.now() - 180000),
      status: 'read'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTypingUser(null);
        
        // Simulate response
        const response: Message = {
          id: Date.now().toString(),
          text: 'Thank you for that information. Based on what you\'ve described, I recommend scheduling an in-person examination.',
          sender: userRole === 'patient' ? 'doctor' : 'ai',
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages(prev => [...prev, response]);
      }, 2000 + Math.random() * 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isTyping, userRole]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate other user typing
    setIsTyping(true);
    setTypingUser(userRole === 'patient' ? 'Dr. Smith' : 'AI Assistant');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderAvatar = (sender: string) => {
    switch (sender) {
      case 'user':
        return <AvatarFallback className="bg-primary text-primary-foreground">You</AvatarFallback>;
      case 'doctor':
        return <AvatarFallback className="bg-blue-500 text-white">Dr</AvatarFallback>;
      case 'ai':
        return <AvatarFallback className="bg-green-500 text-white"><Bot className="h-4 w-4" /></AvatarFallback>;
      default:
        return <AvatarFallback>?</AvatarFallback>;
    }
  };

  const getSenderName = (sender: string) => {
    switch (sender) {
      case 'user':
        return 'You';
      case 'doctor':
        return 'Dr. Smith';
      case 'ai':
        return 'AI Assistant';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Chat
          {isTyping && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              {typingUser} is typing...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar className="h-8 w-8 mt-1">
                {getSenderAvatar(message.sender)}
              </Avatar>
              
              <div className={`flex flex-col max-w-[80%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getSenderName(message.sender)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg text-sm ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  {message.text}
                </div>
                
                {message.sender === 'user' && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && <span className="text-blue-500">✓✓</span>}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 mt-1">
                {getSenderAvatar(userRole === 'patient' ? 'doctor' : 'ai')}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">{typingUser}</span>
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-end space-x-3">
            <Textarea
              placeholder="Type your message (Shift+Enter for new line)..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              className="resize-none flex-1 min-h-[60px] max-h-32"
            />
            <Button 
              onClick={handleSend} 
              size="default"
              disabled={!newMessage.trim()}
              className="px-4 py-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChat;