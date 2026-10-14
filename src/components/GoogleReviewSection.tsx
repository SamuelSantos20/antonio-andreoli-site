import { Star, ArrowUpRight } from 'lucide-react';
import { hasValidGoogleReview, type ProfessionalConfig } from '../config/professional';
import { starFill, type GoogleReviewsData } from '../types/googleReviews';
import { useGoogleReviews } from '../hooks/useGoogleReviews';
import './google-reviews.css';

interface Props {
 config:ProfessionalConfig;
 onReviewClick?:()=>void;
 variant?:'section'|'card';
 className?:string;
 data?:GoogleReviewsData|null;
}
export function RatingStars({rating,compact=false}:{rating:number;compact?:boolean}) {
 return <span className={`rating-stars${compact?' rating-stars--compact':''}`} role="img" aria-label={`${rating.toLocaleString('pt-BR',{maximumFractionDigits:1})} de 5 estrelas`}>
   {Array.from({length:5},(_,index)=><span className="rating-star" key={index} aria-hidden="true"><Star className="rating-star__outline" /><span className="rating-star__fill" style={{width:`${starFill(rating,index)}%`}}><Star /></span></span>)}
 </span>;
}
export function GoogleReviewSection({config,variant='section',className='',data:provided}:Props) {
 const enabled=hasValidGoogleReview(config)||!!provided;
 const {host,state,data}=useGoogleReviews(enabled,provided);
 if(!enabled)return null;
 const rated=!!data&&typeof data.rating==='number'&&Number.isFinite(data.rating)&&data.rating>=1&&data.rating<=5&&data.ratingCount!==0;
 const reviewUrl=data?.reviewUrl||config.googleReviewUrl;
 const mapsUrl=data?.mapsUrl||config.googleMapsUrl;
 const summary=<div className="reviews-summary">
   {rated?<><div className="reviews-score"><span>{data.rating!.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}</span><small>/ 5</small></div><RatingStars rating={data.rating!}/><div className="reviews-meter" role="meter" aria-label="Nota média no Google" aria-valuemin={0} aria-valuemax={5} aria-valuenow={data.rating!} aria-valuetext={`${data.rating!.toLocaleString('pt-BR')} de 5`}><span style={{width:`${data.rating!/5*100}%`}}/></div><p className="reviews-count">{data.ratingCount===null?'Nota publicada no Google':`${data.ratingCount.toLocaleString('pt-BR')} ${data.ratingCount===1?'avaliação':'avaliações'} no Google`}</p></>
     :<p className="reviews-invitation">{state==='loading'?'Consultando as avaliações…':data?.ratingCount===0?'Sua experiência pode ser a primeira.':'Compartilhe sua experiência.'}</p>}
   <span className="google-maps-attribution" translate="no">Google Maps</span>
   {reviewUrl&&<a className="editorial-button" href={reviewUrl} target="_blank" rel="noopener noreferrer">Avaliar no Google <ArrowUpRight size={17} aria-hidden="true"/></a>}
   {mapsUrl&&<a className="editorial-text-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">Ver avaliações no Google <ArrowUpRight size={15} aria-hidden="true"/></a>}
 </div>;
 const body=<div className="reviews-layout">{summary}<div className="reviews-comments">
   {data?.reviews.length?<><p className="reviews-order">Avaliações apresentadas por relevância pelo Google.</p>{data.reviews.map(review=><article className="review-row" key={review.id}>
     <div className="review-author">{review.avatarUrl&&<img src={review.avatarUrl} alt="" loading="lazy" referrerPolicy="no-referrer"/>}<div><a href={review.authorUrl} target="_blank" rel="noopener noreferrer">{review.author}</a><span>{review.published}</span></div><RatingStars rating={review.rating} compact/></div>
     {review.text&&<blockquote>{review.text}</blockquote>}
     <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="review-source">Ler esta avaliação no Google <ArrowUpRight size={13} aria-hidden="true"/></a>
   </article>)}<a className="reviews-policy" href="https://support.google.com/contributionpolicy/answer/7400114" target="_blank" rel="noopener noreferrer">Sobre as avaliações no Google</a></>
     :<div className="reviews-copy"><p>Uma conversa pode fazer diferença.<br/><em>Sua experiência também.</em></p><span>Compartilhe como foi seu atendimento com Antônio Andreoli.</span></div>}
 </div></div>;
 if(variant==='card')return <section ref={host} className={`google-reviews google-reviews--compact ${className}`} aria-labelledby="google-reviews-title"><h2 id="google-reviews-title">Experiências compartilhadas.</h2>{body}</section>;
 return <section id="avaliacoes" ref={host} className={`editorial-section google-reviews ${className}`} aria-labelledby="google-reviews-title"><div className="editorial-container"><div className="reviews-heading"><p className="section-kicker"><span>04</span> EXPERIÊNCIAS COMPARTILHADAS</p><h2 id="google-reviews-title">A sua experiência<br/><em>merece ser ouvida.</em></h2></div>{body}</div></section>;
}

