import C1FullImage from "./workC1";
import C2FullImage from "./workC2";
import C3TwoColImage from "./workC3";
import C4ThreeColImage from "./workC4";
import C8TextCol from "./workC8";
import C7splitLayout from "./workC7";
import C10Quote from "./workC10";
import C11ImageGrid from "./workC11";
import C13LeftAlignedpara from "./workC13";
import C14InfoGrid from "./workc14";

const workComponentMap = {
  "shared.c1": C1FullImage,
  "shared.c2": C2FullImage,
  "shared.c3": C3TwoColImage,
  "shared.c4": C4ThreeColImage,
  "shared.c7": C7splitLayout,
  "shared.c8": C8TextCol,
  "shared.c10": C10Quote,
  "shared.c11": C11ImageGrid,
  "shared.c13": C13LeftAlignedpara,
  "shared.c14": C14InfoGrid,
};

export default workComponentMap;