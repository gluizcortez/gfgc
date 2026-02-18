import { FileText, Paperclip } from 'lucide-react'
import type { Attachment } from '@/types/models'

interface AttachmentListProps {
  attachments: Attachment[]
}

export function AttachmentList({ attachments }: AttachmentListProps): React.JSX.Element {
  if (attachments.length === 0) return <></>

  const handleOpen = (att: Attachment): void => {
    window.api.openAttachment(att.path)
  }

  return (
    <div className="flex items-center gap-1">
      <Paperclip size={12} className="text-gray-400" />
      {attachments.map((att) => (
        <button
          key={att.id}
          onClick={() => handleOpen(att)}
          className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          title={att.name}
        >
          <FileText size={10} />
          {att.name.length > 15 ? att.name.slice(0, 12) + '...' : att.name}
        </button>
      ))}
    </div>
  )
}
