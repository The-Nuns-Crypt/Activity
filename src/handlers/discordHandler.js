import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'

export const DiscordHandler = {
  embed({ title, description, color = 0x2f3136, footer }) {
    const embed = new EmbedBuilder().setColor(color)
    if (title) embed.setTitle(title)
    if (description) embed.setDescription(description)
    if (footer) embed.setFooter({ text: footer })
    return embed
  },

  buttonRow(buttons = []) {
    const row = new ActionRowBuilder()
    buttons.forEach(btn => row.addComponents(btn))
    return row
  },

  button({ id, label, style = 'Primary', disabled = false }) {
    return new ButtonBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(ButtonStyle[style])
      .setDisabled(disabled)
  }
}