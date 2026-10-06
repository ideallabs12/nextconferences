const fs = require('fs');
const path = require('path');

// 1. Fix speakers.json
let speakersJsonPath = path.join('src', 'pages', 'speakers', 'speakers.json');
let speakersData = fs.readFileSync(speakersJsonPath, 'utf8');
speakersData = speakersData.replace(/\/src\/pages\/speakers\/speakers_imgs\//g, '/speakers_imgs/');
fs.writeFileSync(speakersJsonPath, speakersData);

// 2. Fix Conferences.jsx
let conferencesJsxPath = path.join('src', 'pages', 'conferences', 'Conferences.jsx');
let conferencesJsx = fs.readFileSync(conferencesJsxPath, 'utf8');
conferencesJsx = conferencesJsx.replace(/\/src\/pages\/conferences\/conferences_imgs\//g, '/conferences_imgs/');
fs.writeFileSync(conferencesJsxPath, conferencesJsx);

// 3. Fix ConferenceDetail.jsx
let conferenceDetailPath = path.join('src', 'pages', 'conferences', 'ConferenceDetail.jsx');
let conferenceDetail = fs.readFileSync(conferenceDetailPath, 'utf8');
conferenceDetail = conferenceDetail.replace(/\/src\/pages\/conferences\/conferences_imgs\//g, '/conferences_imgs/');
fs.writeFileSync(conferenceDetailPath, conferenceDetail);

// 4. Fix Gallery.jsx
let galleryPath = path.join('src', 'pages', 'gallery', 'Gallery.jsx');
let galleryData = fs.readFileSync(galleryPath, 'utf8');
let galleryReplacement = `const images = [
  '/gallery_imgs/next_gallery_2.jpg',
  '/gallery_imgs/next_gallery_3.jpg',
  '/gallery_imgs/next_gallery_4.jpg',
  '/gallery_imgs/next_gallery_5.jpg',
  '/gallery_imgs/next_gallery_6.jpg',
  '/gallery_imgs/next_gallery_7.jpg',
  '/gallery_imgs/next_gallery_8.jpg',
  '/gallery_imgs/next_gallery_9.jpg',
  '/gallery_imgs/next_gallery_10.jpg',
  '/gallery_imgs/next_gallery_11.jpg',
  '/gallery_imgs/next_gallery_12.jpg',
  '/gallery_imgs/next_gallery_13.jpg'
];`;
galleryData = galleryData.replace(
  /const imageModules = import\.meta\.glob\('\.\/gallery_imgs\/\*\.\(png\|jpg\|jpeg\|webp\)', \{ eager: true, import: 'default' \}\);\s*const images = Object\.values\(imageModules\);/s,
  galleryReplacement
);
fs.writeFileSync(galleryPath, galleryData);

// 5. Fix HomeGallery.jsx
let homeGalleryPath = path.join('src', 'components', 'HomeGallery.jsx');
let homeGalleryData = fs.readFileSync(homeGalleryPath, 'utf8');
let homeGalleryReplacement = `const allImages = [
  '/gallery_imgs/next_gallery_2.jpg',
  '/gallery_imgs/next_gallery_3.jpg',
  '/gallery_imgs/next_gallery_4.jpg',
  '/gallery_imgs/next_gallery_5.jpg',
  '/gallery_imgs/next_gallery_6.jpg',
  '/gallery_imgs/next_gallery_7.jpg',
  '/gallery_imgs/next_gallery_8.jpg',
  '/gallery_imgs/next_gallery_9.jpg',
  '/gallery_imgs/next_gallery_10.jpg',
  '/gallery_imgs/next_gallery_11.jpg',
  '/gallery_imgs/next_gallery_12.jpg',
  '/gallery_imgs/next_gallery_13.jpg'
];`;
homeGalleryData = homeGalleryData.replace(
  /const imageModules = import\.meta\.glob\('\.\.\/pages\/gallery\/gallery_imgs\/\*\.\(png\|jpg\|jpeg\|webp\)', \{ eager: true, import: 'default' \}\);\s*const allImages = Object\.values\(imageModules\);/s,
  homeGalleryReplacement
);
fs.writeFileSync(homeGalleryPath, homeGalleryData);

console.log('Done');
