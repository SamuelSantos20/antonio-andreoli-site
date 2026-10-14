export interface GoogleReview {
  id: string;
  author: string;
  authorUrl: string;
  avatarUrl: string | null;
  rating: number;
  text: string;
  published: string;
  sourceUrl: string;
}
export interface GoogleReviewsData {
  placeName: string;
  rating: number | null;
  ratingCount: number | null;
  mapsUrl: string | null;
  reviewUrl: string | null;
  reviews: GoogleReview[];
}
export function starFill(rating: number, index: number): number {
  const finite = Number.isFinite(rating) ? rating : 0;
  return Math.max(0, Math.min(1, finite-index))*100;
}
export function isGoogleReviewsData(value: unknown): value is GoogleReviewsData {
  if (!value || typeof value !== 'object') return false;
  const data=value as Partial<GoogleReviewsData>;
  return typeof data.placeName==='string'
    && (data.rating===null || typeof data.rating==='number' && Number.isFinite(data.rating) && data.rating>=1 && data.rating<=5)
    && (data.ratingCount===null || typeof data.ratingCount==='number' && Number.isInteger(data.ratingCount) && data.ratingCount>=0)
    && (data.mapsUrl===null||trustedGoogleUrl(data.mapsUrl))
    && (data.reviewUrl===null||trustedGoogleUrl(data.reviewUrl))
    && Array.isArray(data.reviews)&&data.reviews.every(review=>{
      return !!review&&typeof review.id==='string'&&typeof review.author==='string'
        &&typeof review.text==='string'&&typeof review.published==='string'
        &&trustedGoogleUrl(review.authorUrl)&&trustedGoogleUrl(review.sourceUrl)
        &&typeof review.rating==='number'&&Number.isFinite(review.rating)&&review.rating>=1&&review.rating<=5
        &&(review.avatarUrl===null||trustedAvatarUrl(review.avatarUrl));
    });
}
function trustedGoogleUrl(value:unknown):boolean {
 if(typeof value!=='string')return false;
 try {const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['google.com','google.com.br','g.page','maps.app.goo.gl'].some(host=>url.hostname===host||url.hostname.endsWith('.'+host));}catch{return false;}
}
function trustedAvatarUrl(value:unknown):boolean {
 if(typeof value!=='string')return false;
 try {const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['googleusercontent.com','ggpht.com','google.com'].some(host=>url.hostname===host||url.hostname.endsWith('.'+host));}catch{return false;}
}
