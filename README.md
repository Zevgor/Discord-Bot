# Discord-Bot

Currently includes 3 simple commands.

!wowtoken - fetches current World of Warcraft Gold Token conversion price.
!wowarmory - coming soon, simply returns a message stating so.
!nuke - clears all applicable messages in a chat channel, per the restrictions of the bulkDelete Discord API command.
      - Returns an error if user does not have manage message permissions.

Does not include .env file. Inside of ENV file, requires:

BOT_TOKEN= 
> This would be your Discord Bot Token generated from the Discord Developer Portal.

BATTLENET_CLIENT=
BATTLENET_SECRET=
> These would be your Client and Secret keys generated from the Battle.net Developer Portal.
