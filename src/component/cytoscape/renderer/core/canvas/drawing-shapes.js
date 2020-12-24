/**
 * Copyright 2020 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as math from '../../../../../../node_modules/cytoscape/src/math';

var CRp = {};

// @O Polygon drawing
CRp.drawPolygonPath = function (context, x, y, width, height, points) {
  var halfW = width / 2;
  var halfH = height / 2;

  if (context.beginPath) {
    context.beginPath();
  }

  context.moveTo(x + halfW * points[0], y + halfH * points[1]);

  for (var i = 1; i < points.length / 2; i++) {
    context.lineTo(x + halfW * points[i * 2], y + halfH * points[i * 2 + 1]);
  }

  context.closePath();
};

CRp.drawRoundPolygonPath = function (context, x, y, width, height, points) {
  const halfW = width / 2;
  const halfH = height / 2;
  const cornerRadius = math.getRoundPolygonRadius(width, height);

  if (context.beginPath) {
    context.beginPath();
  }

  for (let i = 0; i < points.length / 4; i++) {
    let sourceUv, destUv;
    if (i === 0) {
      sourceUv = points.length - 2;
    } else {
      sourceUv = i * 4 - 2;
    }
    destUv = i * 4 + 2;

    const px = x + halfW * points[i * 4];
    const py = y + halfH * points[i * 4 + 1];

    const cosTheta = -points[sourceUv] * points[destUv] - points[sourceUv + 1] * points[destUv + 1];
    const offset = cornerRadius / Math.tan(Math.acos(cosTheta) / 2);

    const cp0x = px - offset * points[sourceUv];
    const cp0y = py - offset * points[sourceUv + 1];
    const cp1x = px + offset * points[destUv];
    const cp1y = py + offset * points[destUv + 1];

    if (i === 0) {
      context.moveTo(cp0x, cp0y);
    } else {
      context.lineTo(cp0x, cp0y);
    }

    context.arcTo(px, py, cp1x, cp1y, cornerRadius);
  }

  context.closePath();
};

// Round rectangle drawing
CRp.drawRoundRectanglePath = function (context, x, y, width, height) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var cornerRadius = math.getRoundRectangleRadius(width, height);

  if (context.beginPath) {
    context.beginPath();
  }

  // Start at top middle
  context.moveTo(x, y - halfHeight);
  // Arc from middle top to right side
  context.arcTo(x + halfWidth, y - halfHeight, x + halfWidth, y, cornerRadius);
  // Arc from right side to bottom
  context.arcTo(x + halfWidth, y + halfHeight, x, y + halfHeight, cornerRadius);
  // Arc from bottom to left side
  context.arcTo(x - halfWidth, y + halfHeight, x - halfWidth, y, cornerRadius);
  // Arc from left side to topBorder
  context.arcTo(x - halfWidth, y - halfHeight, x, y - halfHeight, cornerRadius);
  // Join line
  context.lineTo(x, y - halfHeight);

  context.closePath();
};

CRp.drawBottomRoundRectanglePath = function (context, x, y, width, height) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var cornerRadius = math.getRoundRectangleRadius(width, height);

  if (context.beginPath) {
    context.beginPath();
  }

  // Start at top middle
  context.moveTo(x, y - halfHeight);
  context.lineTo(x + halfWidth, y - halfHeight);
  context.lineTo(x + halfWidth, y);

  context.arcTo(x + halfWidth, y + halfHeight, x, y + halfHeight, cornerRadius);
  context.arcTo(x - halfWidth, y + halfHeight, x - halfWidth, y, cornerRadius);

  context.lineTo(x - halfWidth, y - halfHeight);
  context.lineTo(x, y - halfHeight);

  context.closePath();
};

CRp.drawCutRectanglePath = function (context, x, y, width, height) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var cornerLength = math.getCutRectangleCornerLength();

  if (context.beginPath) {
    context.beginPath();
  }

  context.moveTo(x - halfWidth + cornerLength, y - halfHeight);

  context.lineTo(x + halfWidth - cornerLength, y - halfHeight);
  context.lineTo(x + halfWidth, y - halfHeight + cornerLength);
  context.lineTo(x + halfWidth, y + halfHeight - cornerLength);
  context.lineTo(x + halfWidth - cornerLength, y + halfHeight);
  context.lineTo(x - halfWidth + cornerLength, y + halfHeight);
  context.lineTo(x - halfWidth, y + halfHeight - cornerLength);
  context.lineTo(x - halfWidth, y - halfHeight + cornerLength);

  context.closePath();
};

CRp.drawBarrelPath = function (context, x, y, width, height) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var xBegin = x - halfWidth;
  var xEnd = x + halfWidth;
  var yBegin = y - halfHeight;
  var yEnd = y + halfHeight;

  var barrelCurveConstants = math.getBarrelCurveConstants(width, height);
  var wOffset = barrelCurveConstants.widthOffset;
  var hOffset = barrelCurveConstants.heightOffset;
  var ctrlPtXOffset = barrelCurveConstants.ctrlPtOffsetPct * wOffset;

  if (context.beginPath) {
    context.beginPath();
  }

  context.moveTo(xBegin, yBegin + hOffset);

  context.lineTo(xBegin, yEnd - hOffset);
  context.quadraticCurveTo(xBegin + ctrlPtXOffset, yEnd, xBegin + wOffset, yEnd);

  context.lineTo(xEnd - wOffset, yEnd);
  context.quadraticCurveTo(xEnd - ctrlPtXOffset, yEnd, xEnd, yEnd - hOffset);

  context.lineTo(xEnd, yBegin + hOffset);
  context.quadraticCurveTo(xEnd - ctrlPtXOffset, yBegin, xEnd - wOffset, yBegin);

  context.lineTo(xBegin + wOffset, yBegin);
  context.quadraticCurveTo(xBegin + ctrlPtXOffset, yBegin, xBegin, yBegin + hOffset);

  context.closePath();
};
CRp.drawNewShapePath = function (context, x, y, width, height) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var xBegin = x - halfWidth;
  var xEnd = x + halfWidth;
  var yBegin = y - halfHeight;
  var yEnd = y + halfHeight;

  var barrelCurveConstants = math.getBarrelCurveConstants(width, height);
  var wOffset = barrelCurveConstants.widthOffset;
  var hOffset = barrelCurveConstants.heightOffset;
  var ctrlPtXOffset = barrelCurveConstants.ctrlPtOffsetPct * wOffset;

  if (context.beginPath) {
    context.beginPath();
  }

  context.moveTo(xBegin, yBegin + hOffset);

  context.lineTo(xBegin, yEnd - hOffset);
  context.quadraticCurveTo(xBegin + ctrlPtXOffset, yEnd, xBegin + wOffset, yEnd);

  context.lineTo(xEnd - wOffset, yEnd);
  context.quadraticCurveTo(xEnd - ctrlPtXOffset, yEnd, xEnd, yEnd - hOffset);

  context.lineTo(xEnd, yBegin + hOffset);
  context.quadraticCurveTo(xEnd - ctrlPtXOffset, yBegin, xEnd - wOffset, yBegin);

  context.lineTo(xBegin + wOffset, yBegin);
  context.quadraticCurveTo(xBegin + ctrlPtXOffset, yBegin, xBegin, yBegin + hOffset);

  context.closePath();
};

var sin0 = Math.sin(0);
var cos0 = Math.cos(0);

var sin = {};
var cos = {};

var ellipseStepSize = Math.PI / 40;

for (var i = 0 * Math.PI; i < 2 * Math.PI; i += ellipseStepSize) {
  sin[i] = Math.sin(i);
  cos[i] = Math.cos(i);
}

CRp.drawEllipsePath = function (context, centerX, centerY, width, height) {
  if (context.beginPath) {
    context.beginPath();
  }

  if (context.ellipse) {
    context.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI);
  } else {
    var xPos, yPos;
    var rw = width / 2;
    var rh = height / 2;
    for (var i = 0 * Math.PI; i < 2 * Math.PI; i += ellipseStepSize) {
      xPos = centerX - rw * sin[i] * sin0 + rw * cos[i] * cos0;
      yPos = centerY + rh * cos[i] * sin0 + rh * sin[i] * cos0;

      if (i === 0) {
        context.moveTo(xPos, yPos);
      } else {
        context.lineTo(xPos, yPos);
      }
    }
  }

  context.closePath();
};

export default CRp;