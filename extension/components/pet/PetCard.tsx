import { cn } from '@/lib/utils/cn'

interface PetCardProps {
  name?: string
  imageUrl?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'add' | 'placeholder'
}

export function PetCard({ name, imageUrl, onClick, className, variant = 'default' }: PetCardProps) {
  if (variant === 'add') {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        <button
          onClick={onClick}
          className="w-full aspect-square border-[10px] border-dashed border-vibe-gray-700 rounded flex items-center justify-center mb-3 hover:bg-vibe-gray-100 hover:border-vibe-gray-800 transition-all duration-300 group"
        >
          <p className="text-5xl font-bold text-vibe-gray-700 group-hover:text-vibe-gray-900 transition-colors">
            ＋
          </p>
        </button>
        <p className="text-[15px] font-bold text-vibe-gray-700">Add New Pet</p>
      </div>
    )
  }

  if (variant === 'placeholder') {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        <div className="w-full aspect-square border-[10px] border-dashed border-vibe-gray-700 rounded flex items-center justify-center mb-3">
          <p className="text-5xl font-bold text-vibe-gray-700">＋</p>
        </div>
        <p className="text-[15px] font-bold text-vibe-gray-700">{name || 'PET NAME HERE'}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center group', className)}>
      <div
        onClick={onClick}
        className={cn(
          'w-full aspect-square bg-vibe-gray-700 rounded flex items-center justify-center mb-3 overflow-hidden transition-all duration-300',
          onClick && 'cursor-pointer hover:shadow-lg hover:scale-105'
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Pet'}
            className="w-full h-full object-cover rounded pixel-art"
          />
        ) : (
          <div className="text-center px-4">
            <p className="text-xl font-bold">
              Pet IMAGE
              <br />
              HERE
            </p>
          </div>
        )}
      </div>
      <p className="text-[15px] font-bold group-hover:text-vibe-dark transition-colors">
        {name || 'PET NAME HERE'}
      </p>
    </div>
  )
}

interface PetGridProps {
  pets: Array<{
    id: string
    name: string
    imageUrl?: string
  }>
  onPetClick?: (petId: string) => void
  onAddClick?: () => void
  maxPets?: number
  className?: string
}

export function PetGrid({ pets, onPetClick, onAddClick, maxPets = 3, className }: PetGridProps) {
  const slots = Array(maxPets).fill(null)

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto', className)}>
      {slots.map((_, index) => {
        const pet = pets[index]

        if (index === 0 && !pet) {
          // First slot: show add button if no pets
          return (
            <PetCard
              key={`add-${index}`}
              variant="add"
              onClick={onAddClick}
            />
          )
        }

        if (pet) {
          // Show existing pet
          return (
            <PetCard
              key={pet.id}
              name={pet.name}
              imageUrl={pet.imageUrl}
              onClick={() => onPetClick?.(pet.id)}
            />
          )
        }

        if (index === pets.length) {
          // Next slot after pets: show add button
          return (
            <PetCard
              key={`add-${index}`}
              variant="add"
              onClick={onAddClick}
            />
          )
        }

        // Empty placeholder slots
        return (
          <PetCard
            key={`placeholder-${index}`}
            variant="placeholder"
          />
        )
      })}
    </div>
  )
}
