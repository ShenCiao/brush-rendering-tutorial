import * as THREE from 'three';
import React, {useEffect, useRef} from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export function ArticulatedLine2D() {
  const test = useRef<Element>();
  return (
    <>
      <Tabs>
        <TabItem value="apple" label="Apple" default>
          This is an apple 🍎
        </TabItem>
        <TabItem value="orange" label="Orange">
          This is an orange 🍊
        </TabItem>
        <TabItem value="banana" label="Banana">
          This is a banana 🍌
        </TabItem>
      </Tabs>
    </>
  );
}