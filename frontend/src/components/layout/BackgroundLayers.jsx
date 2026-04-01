import bgImage from '../../assets/bk.jpg';

export default function BackgroundLayers() {
  return (
    <>
      <img className="bg-video" src={bgImage} alt="" />
      <div className="bg-scrim"></div>
      <div className="noise-layer"></div>
    </>
  );
}
