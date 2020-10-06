import React from 'react';
import Img from 'gatsby-image';
import { ImageValue } from '../../types/utility';

type Props = {
  image: ImageValue;
  imageStyle?: { [key: string]: string };
};

export const Image: React.FC<Props> = ({ image, imageStyle }) => (
  <Img fluid={image} imgStyle={imageStyle} />
);
