'use client';

interface ZoneBox {
  id: string;
  name: string;
  icon: string;
  // Grid position: row, col, rowSpan, colSpan (based on 6-col grid)
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

// 60평 펜션 평면 배치 (6열 x 5행 그리드)
// Row 1: 좌측작은방1 | 거실 (넓게) | 우측작은방2
// Row 2: 큰방1       | 거실 (넓게) | 큰방2
// Row 3: 여자화장실   | 부엌       | 남자화장실
// Row 4: 창고         |            | 바베큐시설
const FLOOR_LAYOUT: ZoneBox[] = [
  { id: 'small_room_left',  name: '\uC88C\uCE21\uC791\uC740\uBC291', icon: '\uD83D\uDECF\uFE0F', row: 1, col: 1, rowSpan: 1, colSpan: 2 },
  { id: 'living',           name: '\uAC70\uC2E4',           icon: '\uD83C\uDFE0', row: 1, col: 3, rowSpan: 2, colSpan: 2 },
  { id: 'small_room_right', name: '\uC6B0\uCE21\uC791\uC740\uBC292', icon: '\uD83D\uDECF\uFE0F', row: 1, col: 5, rowSpan: 1, colSpan: 2 },
  { id: 'big_room_1',       name: '\uD070\uBC291',          icon: '\uD83D\uDECC', row: 2, col: 1, rowSpan: 1, colSpan: 2 },
  { id: 'big_room_2',       name: '\uD070\uBC292',          icon: '\uD83D\uDECC', row: 2, col: 5, rowSpan: 1, colSpan: 2 },
  { id: 'bathroom_female',  name: '\uC5EC\uC790\uD654\uC7A5\uC2E4',   icon: '\uD83D\uDEBA', row: 3, col: 1, rowSpan: 1, colSpan: 2 },
  { id: 'kitchen',          name: '\uBD80\uC5CC',           icon: '\uD83C\uDF73', row: 3, col: 3, rowSpan: 1, colSpan: 2 },
  { id: 'bathroom_male',    name: '\uB0A8\uC790\uD654\uC7A5\uC2E4',   icon: '\uD83D\uDEB9', row: 3, col: 5, rowSpan: 1, colSpan: 2 },
  { id: 'storage',          name: '\uCC3D\uACE0',           icon: '\uD83D\uDDC4\uFE0F', row: 4, col: 1, rowSpan: 1, colSpan: 2 },
  { id: 'bbq',              name: '\uBC14\uBCA0\uD050',     icon: '\uD83D\uDD25', row: 4, col: 4, rowSpan: 1, colSpan: 3 },
];

interface FloorPlanProps {
  onZoneClick: (zoneId: string) => void;
  getZoneColor: (zoneId: string) => string;
  getZoneLabel?: (zoneId: string) => string | null;
}

export default function FloorPlan({ onZoneClick, getZoneColor, getZoneLabel }: FloorPlanProps) {
  return (
    <div className="space-y-2">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, 70px)',
        }}
      >
        {FLOOR_LAYOUT.map(zone => {
          const color = getZoneColor(zone.id);
          const label = getZoneLabel?.(zone.id);
          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className={`rounded-xl border-2 flex flex-col items-center justify-center transition-all text-center p-1 ${color}`}
              style={{
                gridRow: `${zone.row} / span ${zone.rowSpan}`,
                gridColumn: `${zone.col} / span ${zone.colSpan}`,
              }}
            >
              <span className="text-lg leading-none">{zone.icon}</span>
              <span className="text-[10px] font-medium leading-tight mt-0.5">{zone.name}</span>
              {label && (
                <span className="text-[9px] font-bold mt-0.5 bg-white/70 rounded px-1">{label}</span>
              )}
            </button>
          );
        })}
      </div>
      {/* 범례 - 외부 구분 */}
      <div className="flex items-center gap-4 px-1 text-[10px] text-bark-400">
        <span>{'\uD83C\uDFE0 \uB0B4\uBD80 9\uAD6C\uC5ED'}</span>
        <span>{'\uD83D\uDD25 \uC678\uBD80 1\uAD6C\uC5ED'}</span>
      </div>
    </div>
  );
}
