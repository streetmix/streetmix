import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { EditableLabel } from './EditableLabel.js'

describe('EditableLabel', () => {
  it('renders uninteractive label when type is boundary', async () => {
    const label = 'foo'
    const handleClickEdit = vi.fn()
    const { getByRole } = render(
      <EditableLabel
        label={label}
        type="boundary"
        isEditUnlocked={false}
        handleClickEdit={handleClickEdit}
      />
    )

    // Check for proper label
    const labelElement = getByRole('heading')
    expect(labelElement).toHaveTextContent(label)

    // Check for non-interactivity
    await userEvent.click(labelElement)
    expect(handleClickEdit).toHaveBeenCalledTimes(0)
  })

  it('renders uneditable label when type is slice and editability is locked', async () => {
    const label = 'bar'
    const handleClickEdit = vi.fn()
    const { getByRole, container } = render(
      <EditableLabel
        label={label}
        type="slice"
        isEditUnlocked={false}
        handleClickEdit={handleClickEdit}
      />
    )

    // Check for proper label
    const labelElement = getByRole('heading')
    expect(labelElement).toHaveTextContent(label)
    expect(labelElement).toHaveClass('popup-label-editable')

    // Check for lock icon
    const lockIcon = container.querySelector('[data-icon="lock"]')
    expect(lockIcon).toBeInTheDocument()

    // Check for non-interactivity
    await userEvent.click(labelElement)
    expect(handleClickEdit).toHaveBeenCalledTimes(0)
  })

  it('renders editable label when type is slice and editability is unlocked', async () => {
    const label = 'baz'
    const handleClickEdit = vi.fn()
    const { getByRole } = render(
      <EditableLabel
        label={label}
        type="slice"
        isEditUnlocked={true}
        handleClickEdit={handleClickEdit}
      />
    )

    // Check for proper label
    const labelElement = getByRole('heading')
    expect(labelElement).toHaveTextContent(label)
    expect(labelElement).toHaveClass('popup-label-editable')

    // Check for interactivity
    await userEvent.click(labelElement)
    expect(handleClickEdit).toHaveBeenCalledTimes(1)
  })
})
