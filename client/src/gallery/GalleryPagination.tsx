import { FormattedMessage, useIntl } from 'react-intl'

import { fetchGalleryPage } from '~/src/store/actions/gallery.js'
import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { Button } from '~/src/ui/Button.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip, TooltipGroup } from '~/src/ui/Tooltip.js'
import './GalleryPagination.css'

export function GalleryPagination({ isLoading }: { isLoading: boolean }) {
  const { contentDirection } = useSelector((state) => state.app)
  const { streets, pagination } = useSelector((state) => state.gallery)
  const dispatch = useDispatch()
  const intl = useIntl()

  const { page, limit, total, hasNextPage, hasPreviousPage } = pagination
  const start = (page - 1) * limit + 1
  // Calculating end by streets in gallery state accounts for street count
  // after a deletion
  const end = start + streets.length - 1

  function handlePreviousPage() {
    if (!hasPreviousPage || isLoading) return

    dispatch(fetchGalleryPage(page - 1))
  }

  function handleNextPage() {
    if (!hasNextPage || isLoading) return

    dispatch(fetchGalleryPage(page + 1))
  }

  // When we don't have pages, keep the UI simple (what it used to be)
  // otherwise, display pagination UI
  return pagination.totalPages === 1 ? (
    <FormattedMessage
      id="gallery.street-count"
      defaultMessage="{count, plural, =0 {No streets yet} one {# street} other {# streets}}"
      values={{ count: streets.length }}
    />
  ) : (
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
