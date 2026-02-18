import { Paperclip, X, FileText } from 'lucide-react'
import type { Attachment } from '@/types/models'

interface AttachmentInputProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentInput({ attachments, onChange }: AttachmentInputProps): React.JSX.Element {
  const handlePick = async (): Promise<void> => {
    const result = await window.api.pickAttachment()
    if (result) {
      onChange([...attachments, result as Attachment])
    }
  }

  const handleRemove = async (att: Attachment): Promise<void> => {
    await window.api.deleteAttachment(att.path)
    onChange(attachments.filter((a) => a.id !== att.id))
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePick}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700"
      >
        <Paperclip size={14} />
        Anexar arquivo
      </button>
      {attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1">
              <FileText size={14} className="shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-xs text-gray-600">{att.name}</span>
              <span className="text-[10px] text-gray-400">{formatSize(att.size)}</span>
              <button
                type="button"
                onClick={() => handleRemove(att)}
                className="rounded p-0.5 text-gray-400 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
