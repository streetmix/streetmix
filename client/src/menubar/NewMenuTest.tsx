import React, { useState } from 'react'
import * as Menubar from '@radix-ui/react-menubar'
import {
  IoCheckmark,
  IoChevronForwardOutline,
  IoCompass
} from 'react-icons/io5'
import './NewMenuTest.css'
import { FormattedMessage } from 'react-intl'
import Icon from '~/src/ui/Icon'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'
import ExternalLink from '~/src/ui/ExternalLink'
import logo from '../../images/logo_horizontal.svg'

import KeyboardShortcuts from './menus/KeyboardShortcuts'
import UpgradeButton from './UpgradeButton'

const RADIO_ITEMS = ['Andy', 'Benoît', 'Luis']
const CHECK_ITEMS = ['Always Show Bookmarks Bar', 'Always Show Full URLs']

const MenubarDemo = (): React.ReactNode => {
  const [checkedSelection, setCheckedSelection] = useState([CHECK_ITEMS[1]])
  const [radioSelection, setRadioSelection] = useState(RADIO_ITEMS[2])
  const offline = useSelector((state) => state.system.offline)

  const dispatch = useDispatch()

  return (
    <Menubar.Root className="menu-bar" data-newtest={true}>
      <div className="menu-bar-left">
        <div className="menu-bar-title">
          <img src={logo} alt="Streemix" className="menu-bar-logo" />
          <h1>Streetmix</h1>
        </div>

        <Menubar.Menu>
          <Menubar.Trigger className="menubar-trigger">
            <FormattedMessage id="menu.item.help" defaultMessage="Help" />
            <Icon name="chevron-down" className="menu-carat-down" />
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className="menubar-content"
              align="start"
              sideOffset={5}
              alignOffset={0}
              collisionPadding={{ left: 30, right: 30 }}
            >
              <Menubar.Item
                className="menubar-item"
                onClick={(e) => {
                  dispatch(showDialog('ABOUT'))
                }}
              >
                <Icon name="info" className="menu-item-icon" />
                <FormattedMessage
                  id="menu.item.about"
                  defaultMessage="About Streetmix…"
                />
              </Menubar.Item>
              <Menubar.Item
                className="menubar-item"
                onClick={(e) => {
                  dispatch(showDialog('WHATS_NEW'))
                }}
              >
                <Icon name="rocket" className="menu-item-icon" />
                <FormattedMessage
                  id="menu.item.whatsnew"
                  defaultMessage="What’s new?&lrm;"
                />
              </Menubar.Item>
              {!offline && (
                <>
                  <ExternalLink href="https://docs.streetmix.net/user-guide/intro">
                    <Menubar.Item className="menubar-item">
                      <Icon name="trail-sign" className="menu-item-icon" />
                      <FormattedMessage
                        id="menu.help.guidebook-link"
                        defaultMessage="Guidebook"
                      />
                      <Icon name="external-link" />
                    </Menubar.Item>
                  </ExternalLink>
                  <Menubar.Sub>
                    <Menubar.SubTrigger className="menubar-subtrigger">
                      Contact
                      <div className="menubar-item-rightslot">
                        <IoChevronForwardOutline />
                      </div>
                    </Menubar.SubTrigger>
                    <Menubar.Portal>
                      <Menubar.SubContent
                        className="menubar-subcontent"
                        alignOffset={-5}
                      >
                        <ExternalLink href="https://strt.mx/discord">
                          <Menubar.Item className="menubar-item">
                            <Icon name="discord" className="menu-item-icon" />
                            <FormattedMessage
                              id="menu.contact.discord"
                              defaultMessage="Join Discord chat"
                            />
                            {/* bringing this in here instead of setting icon on ExternalLink because it wraps the entire Menubar.Item */}
                            <Icon name="external-link" />
                          </Menubar.Item>
                        </ExternalLink>
                        <ExternalLink href="https://github.com/streetmix/streetmix/">
                          <Menubar.Item className="menubar-item">
                            <Icon name="github" className="menu-item-icon" />
                            <FormattedMessage
                              id="menu.contact.github"
                              defaultMessage="View source code on GitHub"
                            />
                            <Icon name="external-link" />
                          </Menubar.Item>
                        </ExternalLink>
                        <Menubar.Item
                          className="menubar-item"
                          onClick={(e) => {
                            dispatch(showDialog('NEWSLETTER'))
                          }}
                        >
                          <Icon name="mail" className="menu-item-icon" />
                          <FormattedMessage
                            id="menu.contact.newsletter"
                            defaultMessage="Subscribe to our newsletter"
                          />
                        </Menubar.Item>
                      </Menubar.SubContent>
                    </Menubar.Portal>
                  </Menubar.Sub>
                  <Menubar.Separator className="menu-separator" />
                  <ExternalLink href="https://cottonbureau.com/people/streetmix">
                    <Menubar.Item className="menubar-item">
                      <Icon name="cart" className="menu-item-icon" />
                      <FormattedMessage
                        id="menu.item.store"
                        defaultMessage="Store"
                      />
                      <Icon name="external-link" />
                    </Menubar.Item>
                  </ExternalLink>
                </>
              )}
              <Menubar.Separator className="menu-separator" />
              <KeyboardShortcuts />
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>

        <Menubar.Menu>
          <Menubar.Trigger className="menubar-trigger">
            <FormattedMessage id="menu.item.contact" defaultMessage="Contact" />
            <Icon name="chevron-down" className="menu-carat-down" />
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className="menubar-content"
              align="start"
              sideOffset={5}
              alignOffset={-4}
              collisionPadding={{ left: 30, right: 30 }}
            >
              <ExternalLink href="https://strt.mx/discord">
                <Menubar.Item className="menubar-item">
                  <Icon name="discord" className="menu-item-icon" />
                  <FormattedMessage
                    id="menu.contact.discord"
                    defaultMessage="Join Discord chat"
                  />
                  {/* bringing this in here instead of setting icon on ExternalLink because it wraps the entire Menubar.Item */}
                  <Icon name="external-link" />
                </Menubar.Item>
              </ExternalLink>
              <ExternalLink href="https://github.com/streetmix/streetmix/">
                <Menubar.Item className="menubar-item">
                  <Icon name="github" className="menu-item-icon" />
                  <FormattedMessage
                    id="menu.contact.github"
                    defaultMessage="View source code on GitHub"
                  />
                  <Icon name="external-link" />
                </Menubar.Item>
              </ExternalLink>
              <Menubar.Item
                className="menubar-item"
                onClick={(e) => {
                  dispatch(showDialog('NEWSLETTER'))
                }}
              >
                <Icon name="mail" className="menu-item-icon" />
                <FormattedMessage
                  id="menu.contact.newsletter"
                  defaultMessage="Subscribe to our newsletter"
                />
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>

        {/* {!isSubscriber && <UpgradeButton />} */}
        <UpgradeButton />
      </div>

      <div className="menu-bar-right">
        <Menubar.Menu>
          <Menubar.Trigger className="menubar-trigger">
            <a href="/new" target="_blank">
              <FormattedMessage
                id="menu.item.new-street"
                defaultMessage="New street"
              />
              <Icon name="external-link" className="menu-external-link" />
            </a>
          </Menubar.Trigger>
          <Menubar.Portal />
          <Menubar.Trigger className="menubar-trigger">View</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className="MenubarContent"
              align="start"
              sideOffset={5}
              alignOffset={0}
              collisionPadding={{ left: 30, right: 30 }}
            >
              {CHECK_ITEMS.map((item) => (
                <Menubar.CheckboxItem
                  className="MenubarCheckboxItem inset"
                  key={item}
                  checked={checkedSelection.includes(item)}
                  onCheckedChange={() => {
                    setCheckedSelection((current) =>
                      current.includes(item)
                        ? current.filter((el) => el !== item)
                        : current.concat(item)
                    )
                  }}
                >
                  <Menubar.ItemIndicator className="MenubarItemIndicator">
                    <IoCheckmark />
                  </Menubar.ItemIndicator>
                  {item}
                </Menubar.CheckboxItem>
              ))}
              <Menubar.Separator className="menu-separator" />
              <Menubar.Item className="MenubarItem inset">
                Reload <div className="RightSlot">⌘ R</div>
              </Menubar.Item>
              <Menubar.Item className="MenubarItem inset" disabled={true}>
                Force Reload <div className="RightSlot">⇧ ⌘ R</div>
              </Menubar.Item>
              <Menubar.Separator className="menu-separator" />
              <Menubar.Item className="MenubarItem inset">
                Toggle Fullscreen
              </Menubar.Item>
              <Menubar.Separator className="menu-separator" />
              <Menubar.Item className="MenubarItem inset">
                Hide Sidebar
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>

        <Menubar.Menu>
          <Menubar.Trigger className="menubar-trigger">
            Profiles
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className="MenubarContent"
              align="start"
              sideOffset={5}
              alignOffset={0}
              collisionPadding={{ left: 30, right: 30 }}
            >
              <Menubar.RadioGroup
                value={radioSelection}
                onValueChange={setRadioSelection}
              >
                {RADIO_ITEMS.map((item) => (
                  <Menubar.RadioItem
                    className="MenubarRadioItem inset"
                    key={item}
                    value={item}
                  >
                    <Menubar.ItemIndicator className="MenubarItemIndicator">
                      <IoCompass />
                    </Menubar.ItemIndicator>
                    {item}
                  </Menubar.RadioItem>
                ))}
                <Menubar.Separator className="menu-separator" />
                <Menubar.Item className="MenubarItem inset">Edit…</Menubar.Item>
                <Menubar.Separator className="menu-separator" />
                <Menubar.Item className="MenubarItem inset">
                  Add Profile…
                </Menubar.Item>
              </Menubar.RadioGroup>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </div>
    </Menubar.Root>
  )
}

export default MenubarDemo
