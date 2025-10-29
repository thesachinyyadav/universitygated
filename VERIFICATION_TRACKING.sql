-- Add verification tracking columns to visitors table
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_visitors_verified_by ON visitors(verified_by);
CREATE INDEX IF NOT EXISTS idx_visitors_verified_at ON visitors(verified_at);

-- Add comment to columns
COMMENT ON COLUMN visitors.verified_by IS 'Username of the guard who verified this visitor';
COMMENT ON COLUMN visitors.verified_at IS 'Timestamp when the visitor was verified by guard';
