import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RoomStepProps {
  rooms: string[]
  onUpdate: (rooms: string[]) => void
}

const roomOptions = [
  { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'living-room', label: 'Living Room', emoji: '🛋️' },
  { id: 'kids-room', label: "Kids' Room", emoji: '👶' },
  { id: 'home-office', label: 'Home Office', emoji: '🧑‍💻' },
  { id: 'dining-room', label: 'Dining Room', emoji: '🍽️' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { id: 'entryway', label: 'Entryway', emoji: '🚪' },
  { id: 'garage', label: 'Garage', emoji: '🔧' },
]

export function RoomStep({ rooms, onUpdate }: RoomStepProps) {
  const toggleRoom = (roomId: string) => {
    const newRooms = rooms.includes(roomId)
      ? rooms.filter(r => r !== roomId)
      : [...rooms, roomId]
    onUpdate(newRooms)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Where will it go?
        </h2>
        <p className="text-lg text-gray-600">
          Select all rooms where you might use this piece
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {roomOptions.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              rooms.includes(room.id)
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleRoom(room.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{room.emoji}</div>
              <div className="font-medium text-gray-900">{room.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Selected rooms:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {rooms.map((room) => {
              const roomOption = roomOptions.find(r => r.id === room)
              return (
                <Badge key={room} variant="secondary">
                  {roomOption?.emoji} {roomOption?.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {rooms.length === 0 && (
        <div className="text-center text-red-600 text-sm">
          Please select at least one room to continue
        </div>
      )}
    </div>
  )
}