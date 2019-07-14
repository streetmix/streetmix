import React from 'react'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import './MinecraftDialog.scss'
import MINECRAFT_IMAGE_1X from './Minecraft/minecraft.png'
import MINECRAFT_IMAGE_2X from './Minecraft/minecraft@2x.png'

const MinecraftDialog = () => (
  <Dialog>
    {(closeDialog) => (
      <div className="minecraft-dialog" dir="ltr">
        <header>
          <h1>
            Play Minecraft with us!
          </h1>
        </header>
        <div className="dialog-content dialog-content-bleed">
          <img
            srcSet={`
              ${MINECRAFT_IMAGE_1X} 1x,
              ${MINECRAFT_IMAGE_2X} 2x
            `}
            src={MINECRAFT_IMAGE_1X}
            alt="Minecraft server screenshot"
          />
        </div>
        <div className="dialog-content">
          <p>
            <strong>Streetmix is hosting a Minecraft server!</strong>
          </p>
          <p>
            We’re a small, welcoming community of Minecraft aficionados
            building a world together. Like Streetmix, but different!
            To play, log in to <strong>minecraft.streetmix.net</strong> from inside of
            your <a href="https://minecraft.net/" target="_blank" rel="noopener noreferrer">Minecraft game client</a> (Java edition only).
          </p>
          <p>
            For rules and discussion, join us on <a href="https://discord.gg/Y8BMZq6" target="_blank" rel="noopener noreferrer">Discord</a> and
            use the <strong>#minecraft</strong> channel. See you in the world!
          </p>
        </div>
        <button className="dialog-primary-action" onClick={closeDialog}>
          <FormattedMessage id="btn.okay" defaultMessage="Okay!" />
        </button>
      </div>
    )}
  </Dialog>
)

export default MinecraftDialog
