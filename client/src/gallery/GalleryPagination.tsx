import type { GalleryPagination } from '@streetmix/types'
import { Button } from '~src/ui/Button'
import { Icon } from '~src/ui/Icon'
import { Tooltip } from '~src/ui/Tooltip'

interface GalleryPaginationProps {
  pagination: GalleryPagination
}

export function GalleryPagination({ pagination }: GalleryPaginationProps) {
  const { page, limit, total, hasNextPage, hasPreviousPage } = pagination
  const start = (page - 1) * limit + 1
  const end = page * limit

  function handlePreviousPage() {}

  function handleNextPage() {}

  return (
    <>
      {start}–{end} of {total} streets
      <Tooltip label="Previous page">
        <Button disabled={!hasPreviousPage} onClick={handlePreviousPage}>
          <Icon name="chevron-left" />
        </Button>
      </Tooltip>
      <Tooltip label="Next page">
        <Button disabled={!hasNextPage} onClick={handleNextPage}>
          <Icon name="chevron-right" />
        </Button>
      </Tooltip>
    </>
  )
}
