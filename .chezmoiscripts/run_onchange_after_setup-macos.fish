#!/usr/bin/env fish

defaults write -g AppleInterfaceStyle -int 4
defaults write -g AppleEnableSwipeNavigateWithScrolls -int 1
defaults write -g AppleInterfaceStyle -string Dark
defaults write -g AppleKeyboardUIMode -int 2
defaults write -g AppleShowScrollBars -string WhenScrolling
defaults write -g NSPreferredWebServices -dict NSWebServicesProviderWebSearch '{ NSDefaultDisplayName = Google; NSProviderIdentifier = "com.google.www"; }'
defaults write -g NSQuitAlwaysKeepsWindows -int 1
defaults write -g NSTableViewDefaultSizeMode -int 2
defaults write -g NavPanelFileListModeForOpenMode -int 1
defaults write -g NavPanelFileListModeForSaveMode -int 2
defaults write -g com.apple.keyboard.fnState -int 1
defaults write -g com.apple.mouse.scaling -float 0.6875
defaults write -g com.apple.sound.beep.sound -string /System/Library/Sounds/Basso.aiff
defaults write com.apple.AdLib allowApplePersonalizedAdvertising -int 0
defaults write com.apple.AdLib forceLimitAdTracking -int 1
defaults write com.apple.AppleMultitouchTrackpad ActuateDetents -int 0
defaults write com.apple.AppleMultitouchTrackpad ActuationStrength -int 0
defaults write com.apple.Siri StatusMenuVisible -int 0
defaults write com.apple.assistant.backedup "Cloud Sync Enabled" -int 0
defaults write com.apple.assistant.support "Assistant Enabled" -int 0
defaults write com.apple.controlcenter "NSStatusItem Preferred Position Battery" -int 1
defaults write com.apple.controlcenter "NSStatusItem Preferred Position Sound" -int 2
defaults write com.apple.controlcenter "NSStatusItem Preferred Position UserSwitcher" -int 0
defaults write com.apple.controlcenter "NSStatusItem Preferred Position WiFi" -int 3
defaults write com.apple.controlcenter "NSStatusItem Visible AirDrop" -int 0
defaults write com.apple.controlcenter "NSStatusItem Visible Battery" -int 1
defaults write com.apple.controlcenter "NSStatusItem Visible Bluetooth" -int 0
defaults write com.apple.controlcenter "NSStatusItem Visible Sound" -int 1
defaults write com.apple.controlcenter "NSStatusItem Visible UserSwitcher" -int 1
defaults write com.apple.controlcenter "NSStatusItem Visible WiFi" -int 1
defaults write com.apple.dock autohide -int 1
defaults write com.apple.dock expose-group-apps -int 1
defaults write com.apple.dock largesize -int 128
defaults write com.apple.dock magnification -int 0
defaults write com.apple.dock minimize-to-application -int 0
defaults write com.apple.dock show-process-indicators -int 1
defaults write com.apple.dock show-recents -int 0
defaults write com.apple.dock showAppExposeGestureEnabled -int 1
defaults write com.apple.dock tilesize -int 128
defaults write com.apple.finder AppleShowAllFiles -bool true
defaults write com.apple.finder FXDefaultSearchScope -string SCcf
defaults write com.apple.finder FXEnableExtensionChangeWarning -int 0
defaults write com.apple.finder FXPreferredGroupBy -string Name
defaults write com.apple.finder FXPreferredViewStyle -string clmv
defaults write com.apple.finder FXRemoveOldTrashItems -int 1
defaults write com.apple.finder IconViewSettings '{ arrangeBy = name; }'
defaults write com.apple.finder NewWindowTarget -string PfHm
defaults write com.apple.finder NewWindowTargetPath -string file:///Users/caleb/
defaults write com.apple.finder ShowHardDrivesOnDesktop -int 1
defaults write com.apple.finder ShowPreviewPane -int 0
defaults write com.apple.finder ShowRecentTags -int 0
defaults write com.apple.finder ShowHardDrivesOnDesktop -int 1
defaults write com.apple.finder ShowHardDrivesOnDesktop -int 1
defaults write com.apple.finder ShowTabView -int 0
defaults write com.apple.finder SidebarShowingiCloudDesktop -int 0
defaults write com.apple.menuextra.battery ShowPercent -bool true

killall Finder
killall Dock
