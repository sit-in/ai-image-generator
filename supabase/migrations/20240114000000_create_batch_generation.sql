-- 批量生成任务表
CREATE TABLE IF NOT EXISTS batch_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  batch_size INTEGER NOT NULL CHECK (batch_size >= 1 AND batch_size <= 10),
  styles JSONB NOT NULL, -- 数组，如 ["natural", "anime", "oil"]
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_cost INTEGER NOT NULL, -- 总积分消耗
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- 批量生成子任务表
CREATE TABLE IF NOT EXISTS batch_generation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batch_generations(id) ON DELETE CASCADE,
  style VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  image_url TEXT,
  storage_path TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_batch_generations_user_id ON batch_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_generations_status ON batch_generations(status);
CREATE INDEX IF NOT EXISTS idx_batch_generation_items_batch_id ON batch_generation_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_generation_items_status ON batch_generation_items(status);

-- 添加 RLS 策略
ALTER TABLE batch_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_generation_items ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的批量生成任务
CREATE POLICY "Users can view their own batch generations" ON batch_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batch generations" ON batch_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batch generations" ON batch_generations
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能查看自己的批量生成子任务
CREATE POLICY "Users can view their own batch generation items" ON batch_generation_items
  FOR SELECT USING (
    batch_id IN (
      SELECT id FROM batch_generations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own batch generation items" ON batch_generation_items
  FOR INSERT WITH CHECK (
    batch_id IN (
      SELECT id FROM batch_generations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own batch generation items" ON batch_generation_items
  FOR UPDATE USING (
    batch_id IN (
      SELECT id FROM batch_generations WHERE user_id = auth.uid()
    )
  );

-- 管理员可以查看所有批量生成任务
CREATE POLICY "Admins can view all batch generations" ON batch_generations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all batch generation items" ON batch_generation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 创建触发器更新 updated_at
CREATE OR REPLACE FUNCTION update_batch_generation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_batch_generations_updated_at
  BEFORE UPDATE ON batch_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_generation_updated_at();