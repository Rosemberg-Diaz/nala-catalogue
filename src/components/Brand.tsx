import { business } from '../config';
import { assetUrl } from '../data/asset-url';

export default function Brand() {
  return <span className="brand-art"><img src={assetUrl(business.logo)} alt="Nala accesorios" width="1280" height="1280"/></span>;
}
