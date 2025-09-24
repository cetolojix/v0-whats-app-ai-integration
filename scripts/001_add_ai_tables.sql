-- Create conversations table to store WhatsApp conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table to store individual messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id TEXT UNIQUE NOT NULL, -- WhatsApp message ID
  sender_phone TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, audio, document, etc.
  content TEXT,
  media_url TEXT,
  is_from_bot BOOLEAN DEFAULT false,
  ai_response_generated BOOLEAN DEFAULT false,
  ai_model_used TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_configurations table for instance-specific AI settings
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  ai_provider TEXT NOT NULL DEFAULT 'openai', -- openai, anthropic, groq, etc.
  model_name TEXT NOT NULL DEFAULT 'gpt-4',
  system_prompt TEXT DEFAULT 'You are a helpful WhatsApp assistant.',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  auto_reply_enabled BOOLEAN DEFAULT true,
  response_delay_seconds INTEGER DEFAULT 2,
  conversation_memory_enabled BOOLEAN DEFAULT true,
  max_conversation_history INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id)
);

-- Create webhook_logs table for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL, -- incoming_message, status_update, etc.
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations 
  FOR SELECT USING (
    instance_id IN (
      SELECT id FROM instances WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own conversations" ON conversations 
  FOR INSERT WITH CHECK (
    instance_id IN (
      SELECT id FROM instances WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own conversations" ON conversations 
  FOR UPDATE USING (
    instance_id IN (
      SELECT id FROM instances WHERE user_id = auth.uid()
    )
  );

-- RLS policies for messages
CREATE POLICY "Users can view their own messages" ON messages 
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c 
      JOIN instances i ON c.instance_id = i.id 
      WHERE i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own messages" ON messages 
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM conversations c 
      JOIN instances i ON c.instance_id = i.id 
      WHERE i.user_id = auth.uid()
    )
  );

-- RLS policies for ai_configurations
CREATE POLICY "Users can view their own AI configs" ON ai_configurations 
  FOR SELECT USING (
    instance_id IN (
      SELECT id FROM instances WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own AI configs" ON ai_configurations 
  FOR INSERT WITH CHECK (
    instance_id IN (
      SELECT id FROM instances WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own AI configs" ON ai_configurations 
  FOR UPDATE USING (
    instance_id IN (
      SELECT id FROM instances WHERE user_id = auth.uid()
    )
  );

-- RLS policies for webhook_logs (admin only for debugging)
CREATE POLICY "Admins can view all webhook logs" ON webhook_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_instance_id ON conversations(instance_id);
CREATE INDEX IF NOT EXISTS idx_conversations_phone_number ON conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_configurations_instance_id ON ai_configurations(instance_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_instance_id ON webhook_logs(instance_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);

-- Create function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation when new message is added
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
