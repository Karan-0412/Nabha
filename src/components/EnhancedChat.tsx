import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/aiService';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI health assistant. How can I help you today?',
      sender: userRole === 'patient' ? 'doctor' : 'ai',
      timestamp: new Date(Date.now() - 300000),
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

  // Handle AI response generation
  useEffect(() => {
    if (isTyping) {
      const generateAIResponse = async () => {
        try {
          // Get the last user message for context
          const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
          if (!lastUserMessage) return;

          // Get conversation context
          const context = messages.slice(-5).map(m => 
            `${m.sender}: ${m.text}`
          ).join('\n');

          const response = await aiService.chatResponse(
            lastUserMessage.text, 
            context, 
            i18n.language
          );

          const aiMessage: Message = {
            id: Date.now().toString(),
            text: response,
            sender: userRole === 'patient' ? 'doctor' : 'ai',
            timestamp: new Date(),
            status: 'sent'
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('AI response error:', error);
          const errorMessage: Message = {
            id: Date.now().toString(),
            text: 'I apologize, but I\'m having trouble processing your request right now. Please try again or consult with a healthcare professional.',
            sender: userRole === 'patient' ? 'doctor' : 'ai',
            timestamp: new Date(),
            status: 'sent'
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
          setTypingUser(null);
        }
      };

      // Add a small delay to show typing indicator
      const timer = setTimeout(generateAIResponse, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTyping, messages, userRole, i18n.language]);

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