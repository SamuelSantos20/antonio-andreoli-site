const googleHosts = ['google.com','google.com.br','maps.google.com','g.page','maps.app.goo.gl'];
export function googleLink(value) {
  if (typeof value !== 'string') return null;
  try {
    const url=new URL(value);
    return url.protocol==='https:' && !url.username && !url.password
      && googleHosts.some(host=>url.hostname===host||url.hostname.endsWith('.'+host)) ? url.href : null;
  } catch { return null; }
}
function avatarLink(value) {
  if(typeof value!=='string')return null;
  try { const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['googleusercontent.com','ggpht.com','google.com'].some(host=>url.hostname===host||url.hostname.endsWith('.'+host))?url.href:null; } catch { return null; }
}
function rating(value) { return typeof value==='number'&&Number.isFinite(value)&&value>=1&&value<=5?value:null; }
export function normalizePlace(place) {
  if (!place || typeof place!=='object') throw new Error('Invalid Google response');
  const placeRating=rating(place.rating);
  const ratingCount=Number.isInteger(place.userRatingCount)&&place.userRatingCount>=0?place.userRatingCount:null;
  const reviews=(Array.isArray(place.reviews)?place.reviews:[]).slice(0,5).flatMap((review,index)=>{
    const value=rating(review?.rating);
    const author=review?.authorAttribution;
    const authorUrl=googleLink(author?.uri), sourceUrl=googleLink(review?.googleMapsUri);
    if(value===null||typeof author?.displayName!=='string'||!authorUrl||!sourceUrl)return [];
    const text=typeof review.originalText?.text==='string'?review.originalText.text:typeof review.text?.text==='string'?review.text.text:'';
    return [{id:typeof review.name==='string'?review.name:String(index),author:author.displayName,authorUrl,avatarUrl:avatarLink(author.photoUri),rating:value,text,published:typeof review.relativePublishTimeDescription==='string'?review.relativePublishTimeDescription:'',sourceUrl}];
  });
  return {
    placeName:typeof place.displayName?.text==='string'?place.displayName.text:'',
    rating:ratingCount===0?null:placeRating,
    ratingCount,
    mapsUrl:googleLink(place.googleMapsLinks?.reviewsUri)||googleLink(place.googleMapsUri),
    reviewUrl:googleLink(place.googleMapsLinks?.writeAReviewUri),
    reviews,
  };
}
export async function loadGoogleReviews(env=process.env, fetcher=fetch) {
  const key=env.GOOGLE_PLACES_API_KEY?.trim(), placeId=env.GOOGLE_PLACE_ID?.trim();
  if(!key||!placeId)return {state:'not-configured',data:null};
  if(!/^[A-Za-z0-9_-]{5,250}$/.test(placeId))return {state:'unavailable',data:null};
  try {
    const response=await fetcher('https://places.googleapis.com/v1/places/'+encodeURIComponent(placeId)+'?languageCode=pt-BR',{
      headers:{'X-Goog-Api-Key':key,'X-Goog-FieldMask':'displayName,rating,userRatingCount,googleMapsUri,googleMapsLinks,reviews'},
      signal:AbortSignal.timeout(6000),
    });
    if(!response.ok)return {state:'unavailable',data:null};
    return {state:'ready',data:normalizePlace(await response.json())};
  }catch{return {state:'unavailable',data:null};}
}
export async function googleReviewsHandler(req,res,env=process.env) {
  const path=new URL(req.url||'/', 'http://localhost').pathname;
  if(path!=='/api/google-reviews')return false;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');res.end(JSON.stringify({state:'unavailable',data:null}));return true;}
  // No review data is cached, persisted or written to logs.
  const result=await loadGoogleReviews(env);
  res.statusCode=result.state==='unavailable'?503:200;
  res.end(JSON.stringify(result));
  return true;
}
