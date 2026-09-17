const PLAYLIST_ID = 'PLKpRxBfeD1kGl3UM5cE6oOOFf67mZN0fg'

const source = [
  ['7ggoO2LZsY0', 'Downloading & Updating the Zoom Desktop Client', 'Desktop client setup and updates', ['Devices & App']],
  ['sZO7P61h8Mc', 'Navigating the Zoom Web Portal', 'Finding settings and account controls in the web portal', ['Devices & App']],
  ['jvE1cShPlds', 'Zoom Personal Profile and Meeting ID', 'Personal profile and meeting ID basics', ['Meeting Controls']],
  ['mHt2sZUYEx4', 'Basic Zoom Meeting Settings', 'Core meeting settings', ['Meeting Controls']],
  ['pAMDxH_H_Cs', 'How to Join a Zoom Meeting', 'Joining a Zoom meeting', ['Joining Meetings']],
  ['Dcd6nNmtGo0', 'Basic In-Meeting Navigation', 'In-meeting controls and navigation', ['Meeting Controls']],
  ['ugda61PyFIo', 'How to Mute and Unmute on Zoom (PC, Mac & Phone Calls)', 'Mute and unmute controls across supported devices', ['Audio & Microphone', 'Devices & App']],
  ['4CtzOslMRs8', 'How to Change Background on Zoom: Step-by-Step Guide', 'Changing video backgrounds', ['Camera & Video']],
  ['0ZxPLJC4NMc', 'Zoom In-Meeting Chat and Reactions', 'Chat and reactions during a meeting', ['Meeting Controls']],
  ['C4sptqFb0Bk', 'How to Share Your Screen on Zoom with Video and Audio', 'Screen sharing with video and audio', ['Screen Sharing', 'Audio & Microphone']],
  ['4Rly4y7ya9k', 'How to Pin vs. Spotlight in Zoom: What’s the Difference?', 'Pin and spotlight video controls', ['Camera & Video', 'Meeting Controls']],
  ['zGBRmCLlXVU', 'How to Change View in a Zoom Meeting', 'Meeting video view controls', ['Camera & Video', 'Meeting Controls']],
  ['Cbw1UhvSQRU', 'How to Create & Schedule a Zoom Meeting', 'Creating and scheduling a meeting', ['Meeting Controls']],
  ['6Yc8buRY1Mg', 'How to Invite Participants to a Zoom Meeting', 'Inviting people to a meeting', ['Meeting Controls']],
  ['wXgJWxGpl3o', 'Where Do Zoom Local Recordings Save? (Step-by-Step)', 'Finding local recordings', ['Devices & App']],
  ['9wjrQAAi0DU', 'How to Record a Zoom Meeting to the Cloud', 'Cloud recording basics', ['Meeting Controls']],
  ['dgs9mjnycaE', 'Zoom Security Basics for Meetings and Webinars', 'Meeting and webinar security controls', ['Meeting Controls']],
  ['lnORgJO40wg', 'How to Set Up and Schedule a Zoom Webinar', 'Webinar setup and scheduling', ['Meeting Controls']],
  ['MZSfWrcL2gY', 'Sending and Responding To Chats', 'Sending and replying to chat messages', ['Meeting Controls']],
  ['KzoJ51Tpu1c', 'Zoom Waiting Room: How to Enable and Configure Settings', 'Waiting Room configuration', ['Joining Meetings', 'Meeting Controls']],
  ['yZKikATjDog', 'Zoom Tutorial: How to Mute Participants and Block Cameras', 'Host controls for participant audio and video', ['Audio & Microphone', 'Camera & Video', 'Meeting Controls']],
  ['rUYrI3fOGjA', 'How to Record a Zoom Meeting: Complete Step-by-Step Guide', 'Recording meeting basics', ['Meeting Controls']],
  ['gDcB2LjtWt0', 'Your Learning Center Dashboard', 'Navigating the Zoom Learning Center', []],
  ['x6bIVS6IV18', 'How to Change Zoom Meeting Settings', 'Changing meeting settings', ['Meeting Controls']],
  ['emxXSnsRTfg', 'How to Host a Simulive Webinar in Zoom with Pre-Recorded Content', 'Hosting simulive webinars', ['Meeting Controls']],
  ['fkicyVMljOw', 'Zoom Virtual Agent: How to Navigate Admin Portal', 'Navigating the Virtual Agent admin portal', []],
  ['idEfUlb4rRs', 'How to Use Zoom Whiteboard (Beginner\'s Guide to Tools & Navigation)', 'Zoom Whiteboard tools and navigation', ['Meeting Controls']],
  ['C4Yftizg-sg', 'How to Use Zoom Docs for Collaboration and Project Tracking', 'Zoom Docs collaboration basics', []],
  ['Kbt2VRzoX_I', 'How to Use Zoom Workflow Automation', 'Zoom Workflow Automation basics', []],
  ['9qSAqayNECk', 'Custom AI Companion: Reps Win Faster with AI', 'Custom AI Companion overview', []],
  ['J3zAOtEgDQI', 'How to use a Zoom Chat AI Agent: Your AI-Powered Assistant', 'Zoom Chat AI Agent overview', []],
]

export const TRAINING_VIDEOS = source.map(([videoId, title, usefulFor, relatedCategories], index) => ({
  id: `training-${String(index + 1).padStart(2, '0')}`,
  videoId,
  title,
  youtubeUrl: `https://www.youtube.com/watch?v=${videoId}&list=${PLAYLIST_ID}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  playlistId: PLAYLIST_ID,
  sortOrder: index + 1,
  usefulFor,
  relatedCategories,
}))

export const TRAINING_CATEGORIES = ['All', ...new Set(TRAINING_VIDEOS.flatMap((video) => video.relatedCategories))]

export function trainingEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
}

export function relatedTrainingForCategory(categoryName) {
  return TRAINING_VIDEOS.filter((video) => video.relatedCategories.includes(categoryName))
}
