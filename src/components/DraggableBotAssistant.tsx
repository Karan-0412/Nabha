import { useState, useRef, useEffect } from "react";
import { Send, X, Minimize2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function DraggableBotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 100,
    y: window.innerHeight - 100,
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I'm your AI health assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [lastTap, setLastTap] = useState(0);

  const iconRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y,
      });
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    setLastTap(currentTime);

    if (iconRef.current) {
      const touch = e.touches[0];
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleDoubleClick = () => {
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "Sorry, I didn’t understand that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: "bot",
          text: "⚠️ Oops! Something went wrong while connecting to AI.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Positioning
  const getChatStyle = () => {
    const ICON_SIZE = 56;
    const GAP = 12;
    const CHAT_WIDTH = 320;
    const CHAT_HEIGHT = isMinimized ? 48 : 384;

    let left = position.x - CHAT_WIDTH - GAP;
    let top = position.y - CHAT_HEIGHT + ICON_SIZE / 2;

    if (left < 8) left = position.x + ICON_SIZE / 2 + GAP;

    const maxLeft = window.innerWidth - CHAT_WIDTH - 8;
    const maxTop = window.innerHeight - CHAT_HEIGHT - 8;
    left = Math.min(Math.max(8, left), maxLeft);
    top = Math.min(Math.max(8, top), maxTop);

    return { left: `${left}px`, top: `${top}px` };
  };

  useEffect(() => {
    const handleResize = () => setPosition((p) => ({ ...p }));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Draggable Bot Icon */}
      <Button
        ref={iconRef}
        className="fixed w-14 h-14 rounded-full bg-primary hover:bg-primary-hover shadow-lg z-50 cursor-move select-none"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
        onClick={() => {
          if (!isDragging) setIsOpen((v) => !v);
        }}
      >
        <Bot className="h-6 w-6 text-primary-foreground" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card
          ref={chatRef}
          className={`fixed w-80 h-96 shadow-2xl z-40 transition-all duration-300 ${
            isMinimized ? "h-12" : "h-96"
          }`}
          style={getChatStyle()}
        >
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm">Health Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-3 pt-0 flex flex-col h-full">
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {/* ✅ Keeps scroll at bottom */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex items-center space-x-2 mt-3">
                <Input
                  placeholder="Type your health question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
