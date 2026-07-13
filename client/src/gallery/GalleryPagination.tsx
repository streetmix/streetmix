import { openGallery } from '~/src/store/actions/gallery'
import { useDispatch, useSelector } from '~/src/store/hooks'
import { Button } from '~/src/ui/Button'
import { Icon } from '~/src/ui/Icon'
import { Tooltip, TooltipGroup } from '~/src/ui/Tooltip'
import './GalleryPagination.css'

import type { GalleryPagination } from '@streetmix/types'
import { FormattedMessage, useIntl } from 'react-intl'

interface GalleryPaginationProps {
  pagination: GalleryPagination
}

export function GalleryPagination({ pagination }: GalleryPaginationProps) {
  const { contentDirection } = useSelector((state) => state.app)
  const galleryUserId = useSelector((state) => state.gallery.userId)
  const dispatch = useDispatch()
  const intl = useIntl()

  const { page, limit, total, hasNextPage, hasPreviousPage } = pagination
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  function handlePreviousPage() {
    if (!hasPreviousPage) return

    dispatch(
      openGallery({
        userId: galleryUserId,
        page: page - 1,
      })
    )
  }

  function handleNextPage() {
    if (!hasNextPage) return

    dispatch(
      openGallery({
        userId: galleryUserId,
        page: page + 1,
      })
    )
  }

  return (
    <>
      <FormattedMessage
        id="gallery.pagination.count"
        defaultMessage="{start}–{end} of {total} streets"
        values={{
          start,
          end,
          total,
        }}
      />
      <TooltipGroup>
        <Tooltip
          label={intl.formatMessage({
            id: 'gallery.pagination.back',
            defaultMessage: 'Previous page',
          })}
        >
          <Button
            className="gallery-pagination-button"
            disabled={!hasPreviousPage}
            onClick={handlePreviousPage}
          >
            <Icon
              name={
                contentDirection === 'rtl' ? 'chevron-right' : 'chevron-left'
              }
              size="20"
            />
          </Button>
        </Tooltip>
        <Tooltip
          label={intl.formatMessage({
            id: 'gallery.pagination.next',
            defaultMessage: 'Next page',
          })}
        >
          <Button
            className="gallery-pagination-button"
            disabled={!hasNextPage}
            onClick={handleNextPage}
          >
            <Icon
              name={
                contentDirection === 'rtl' ? 'chevron-left' : 'chevron-right'
              }
              size="20"
            />
          </Button>
        </Tooltip>
      </TooltipGroup>
    </>
  )
}
