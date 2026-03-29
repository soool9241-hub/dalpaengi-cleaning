'use client';

interface FloorPlanProps {
  onZoneClick: (zoneId: string) => void;
  getZoneColor: (zoneId: string) => string;
  getZoneLabel?: (zoneId: string) => string | null;
}

export default function FloorPlan({ onZoneClick, getZoneColor, getZoneLabel }: FloorPlanProps) {
  // 실제 달팽이아지트 평면 반영 (8열 x 6행 그리드)
  // 상단: 여자화장실 | 남자화장실 | 부엌 | 창고
  // 중상: 큰방2 | 거실(중앙) | (빈공간)
  // 중하: 큰방1 | 거실(계속) | 우측작은방
  // 하단: (빈) | 현관 | 좌측작은방
  // 우측 외부: 바베큐

  const zones = [
    // 상단 행 - 화장실들 + 부엌 + 창고
    { id: 'bathroom_female', name: '\uC5EC\uC790\uD654\uC7A5\uC2E4', icon: '\uD83D\uDEBA',
      top: '0%', left: '0%', width: '18%', height: '20%' },
    { id: 'bathroom_male', name: '\uB0A8\uC790\uD654\uC7A5\uC2E4', icon: '\uD83D\uDEB9',
      top: '0%', left: '19%', width: '18%', height: '20%' },
    { id: 'kitchen', name: '\uBD80\uC5CC', icon: '\uD83C\uDF73',
      top: '0%', left: '38%', width: '28%', height: '20%' },
    { id: 'storage', name: '\uCC3D\uACE0', icon: '\uD83D\uDDC4\uFE0F',
      top: '0%', left: '67%', width: '13%', height: '20%' },

    // 좌측 - 큰방2 (위), 큰방1 (아래)
    { id: 'big_room_2', name: '\uD070\uBC292', icon: '\uD83D\uDECC',
      top: '22%', left: '0%', width: '25%', height: '28%' },
    { id: 'big_room_1', name: '\uD070\uBC291', icon: '\uD83D\uDECC',
      top: '52%', left: '0%', width: '25%', height: '28%' },

    // 중앙 - 거실
    { id: 'living', name: '\uAC70\uC2E4', icon: '\uD83C\uDFE0',
      top: '22%', left: '26%', width: '30%', height: '38%' },

    // 현관 좌우 - 작은방들
    { id: 'small_room_left', name: '\uC88C\uCE21\uC791\uC740\uBC291', icon: '\uD83D\uDECF\uFE0F',
      top: '62%', left: '26%', width: '14%', height: '18%' },
    { id: 'small_room_right', name: '\uC6B0\uCE21\uC791\uC740\uBC292', icon: '\uD83D\uDECF\uFE0F',
      top: '62%', left: '42%', width: '14%', height: '18%' },

    // 외부 - 바베큐 (우측 초록 영역)
    { id: 'bbq', name: '\uBC14\uBCA0\uD050', icon: '\uD83D\uDD25',
      top: '22%', left: '58%', width: '22%', height: '58%' },
  ];

  return (
    <div className="space-y-2">
      {/* Floor Plan */}
      <div className="relative w-full bg-bark-50 rounded-2xl border border-bark-200 overflow-hidden"
        style={{ paddingBottom: '75%' /* aspect ratio */ }}
      >
        {/* 현관 표시 */}
        <div className="absolute flex items-center justify-center text-[10px] text-bark-400 font-medium border border-dashed border-bark-300 rounded-lg bg-white/50"
          style={{ top: '82%', left: '32%', width: '16%', height: '8%' }}
        >
          {'\uD83D\uDEAA \uD604\uAD00'}
        </div>

        {/* 외부 잔디 배경 */}
        <div className="absolute rounded-xl bg-green-100/60"
          style={{ top: '18%', left: '55%', width: '28%', height: '68%', zIndex: 0 }}
        />

        {/* Zones */}
        {zones.map(zone => {
          const color = getZoneColor(zone.id);
          const label = getZoneLabel?.(zone.id);
          const isBBQ = zone.id === 'bbq';

          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className={`absolute rounded-xl border-2 flex flex-col items-center justify-center transition-all text-center p-0.5 z-10
                ${color}
                ${isBBQ ? 'border-dashed' : ''}`}
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.width,
                height: zone.height,
              }}
            >
              <span className="text-base leading-none">{zone.icon}</span>
              <span className="text-[9px] font-semibold leading-tight mt-0.5">{zone.name}</span>
              {label && (
                <span className="text-[9px] font-bold mt-0.5 bg-white/80 rounded px-1">{label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-between px-1 text-[10px] text-bark-400">
        <span>{'\uD83C\uDFE0 \uB0B4\uBD80 9\uAD6C\uC5ED'}</span>
        <span>{'\uD83D\uDD25 \uC678\uBD80 1\uAD6C\uC5ED (\uBC14\uBCA0\uD050)'}</span>
        <span>{'\uD83D\uDEAA \uD604\uAD00'}</span>
      </div>
    </div>
  );
}
