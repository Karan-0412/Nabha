import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Stethoscope, Camera, MessageSquare, Bot, Search, Settings, Send, User, Menu, X } from 'lucide-react';
import SymptomChecker from '@/components/SymptomChecker';
import ImageChecker from '@/components/ImageChecker';
import { useUserContext } from '@/context/user-role';
import { ensureRoom, getMessagesForRoom, addMessage, onMessagesUpdate, ChatRoom as StoredRoom, MessageRecord } from '@/store/messageStore';
import { alternativeAIService } from '@/services/alternativeAIService';

const AIAssistantPage = () => {
  const { t, i18n } = useTranslation();
  const { userRole } = useUserContext();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedRoom, setSelectedRoom] = useState<string>('ai-assistant');
  const [rooms, setRooms] = useState<StoredRoom[]>(() => getStoredRooms());
  const [messages, setMessages] = useState<MessageRecord[]>(() => getMessagesForRoom(selectedRoom));
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Function to clear messages for a room using the message store structure
  const clearMessagesForRoom = (roomId: string) => {
    try {
      const stored = window.localStorage.getItem('telemed-messages-v1');
      if (stored) {
        const data = JSON.parse(stored);
        // Filter out messages for this room
        data.messages = data.messages.filter((msg: any) => msg.roomId !== roomId);
        window.localStorage.setItem('telemed-messages-v1', JSON.stringify(data));
        console.log(`Cleared messages for room: ${roomId}`);
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  const chatRooms = useMemo(() => {
    const base: any[] = [
      { id: 'ai-assistant', name: 'AI Assistant', type: 'ai', lastMessage: 'Hello! I\'m Dr. AI, your virtual health assistant. How can I help you today?', timestamp: 'now', unreadCount: 0 },
    ];
    return base.concat(rooms.map(r => ({ id: r.id, name: r.name, type: r.type, lastMessage: '', timestamp: '', unreadCount: 0 })));
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    if (!searchTerm) return chatRooms;
    return chatRooms.filter(room => 
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chatRooms, searchTerm]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const sender = userRole === 'doctor' ? 'doctor' : userRole === 'patient' ? 'patient' : 'system';
    const messageText = inputValue.trim();
    
    // Hide disclaimer when user sends first message
    if (showDisclaimer) {
      setShowDisclaimer(false);
    }
    
    // Add user message
    addMessage(selectedRoom, sender as any, messageText);
    setMessages(getMessagesForRoom(selectedRoom));
    setInputValue('');

    // If it's the AI assistant room, generate AI response
    if (selectedRoom === 'ai-assistant') {
      setIsTyping(true);
      try {
        // Get recent conversation context
        const recentMessages = getMessagesForRoom(selectedRoom).slice(-5);
        const context = recentMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
        
        const aiResponse = await alternativeAIService.chatResponse(
          messageText, 
          context, 
          i18n.language
        );
        
        // Add AI response after a short delay
        setTimeout(() => {
          addMessage(selectedRoom, 'assistant', aiResponse);
          setMessages(getMessagesForRoom(selectedRoom));
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        console.error('AI response error:', error);
        setTimeout(() => {
          addMessage(selectedRoom, 'assistant', 'I apologize, but I\'m having trouble processing your request right now. Please try again or consult with a healthcare professional.');
          setMessages(getMessagesForRoom(selectedRoom));
          setIsTyping(false);
        }, 1000);
      }
    }
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Chat History Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Get AI-powered health insights, symptom analysis, and medical guidance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              // Create new chat by clearing messages and resetting
              clearMessagesForRoom('ai-assistant'); // Clear from localStorage
              
              // Force a complete reset
              setSelectedRoom('ai-assistant');
              setMessages([]); // Clear messages array immediately
              setShowDisclaimer(true);
              setInputValue(''); // Clear input field
              setIsNewChat(true); // Show visual feedback
              
              // Force refresh the messages from the cleared store
              setTimeout(() => {
                const clearedMessages = getMessagesForRoom('ai-assistant');
                setMessages(clearedMessages);
                console.log('New chat started - messages cleared and reset. Current messages:', clearedMessages.length);
              }, 200);
              
              // Reset the new chat indicator after a short delay
              setTimeout(() => setIsNewChat(false), 2000);
            }}
          >
            <MessageSquare className="h-4 w-4" />
            New Chat
          </Button>
          <Sheet open={isChatSidebarOpen} onOpenChange={setIsChatSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Chat History
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Chat History
              </h2>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {filteredRooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={selectedRoom === room.id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => {
                      setSelectedRoom(room.id);
                      setMessages(getMessagesForRoom(room.id));
                      setIsChatSidebarOpen(false);
                      // Show disclaimer for new chat rooms
                      if (room.id === 'ai-assistant' && getMessagesForRoom(room.id).length === 0) {
                        setShowDisclaimer(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={room.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                          {room.type === 'ai' ? <Bot className="h-4 w-4" /> : room.name.split(' ').map((n:any) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-sm truncate">{room.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{room.lastMessage}</div>
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Symptom Checker
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Image Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask questions about your health, get general medical advice, and receive guidance on when to see a doctor.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4 border rounded-lg mb-4">
                  <div className="space-y-4">
                    {/* Medical Disclaimer - shown when starting new chat */}
                    {showDisclaimer && messages.length === 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Medical Disclaimer</h4>
                            <p className="text-sm text-blue-700">
                              Dr. AI Assistant provides general health information and guidance only. 
                              It is not a substitute for professional medical advice, diagnosis, or treatment. 
                              Always consult with a qualified healthcare provider for any medical concerns. 
                              In case of emergency, contact your local emergency services immediately.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* New Chat Indicator */}
                    {isNewChat && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
                        <p className="text-sm text-green-700 font-medium">
                          ✨ New chat started! Ask Dr. AI about your health concerns.
                        </p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.sender === 'patient' || message.sender === 'doctor' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={message.sender === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                            {message.sender === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col max-w-[80%] ${message.sender === 'patient' || message.sender === 'doctor' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {message.sender === 'assistant' ? 'Dr. AI' : message.sender === 'patient' ? 'You' : 'Doctor'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className={`p-3 rounded-lg text-sm ${
                            message.sender === 'patient' || message.sender === 'doctor'
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            {message.text}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Dr. AI</span>
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
                    
                    {/* Auto-scroll target - inside ScrollArea */}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex items-end space-x-3">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="mt-6">
          <SymptomChecker />
        </TabsContent>

        <TabsContent value="image" className="mt-6">
          <ImageChecker />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default AIAssistantPage;
