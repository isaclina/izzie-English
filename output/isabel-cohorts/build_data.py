import json
A_SRC='../isabel-2020-1M-top4/'
COH={
 'A':dict(name='2020 중1 반 (김건희 반)',short='2020 김건희 반',years='2020–2022',classes='1M-A → 2M-A → 3M-A'),
 'B':dict(name='2023 중1 반 (구성관 반)',short='2023 구성관 반',years='2023–2025',classes='1M-S → 2M-S → 3M-S'),
 'C':dict(name='2025 중1 반 (이서연 반)',short='2025 이서연 반',years='2025–2026',classes='1M-A → 2M-A'),
}
mock=[];nae=[]
for r in json.load(open(A_SRC+'mock.json')):
    mock.append(dict(cohort='A',student=r['student'],year=r['year'],grade=r['grade'],seq=r['seq'],exam=r['exam'],level=r['level'],
        listening=r['listening'],reading=r['reading'],total=r['total'],tier=r['tier'],note=r['note']))
for r in json.load(open(A_SRC+'naesin.json')):
    nae.append(dict(cohort='A',student=r['student'],year=2022,grade='중3',term=f"{r['semester']} {r['test']}",score=r['score'],note=r['note']))
def add(c,s,year,grade,seq,level,l,r,t,g,note=None):
    mock.append(dict(cohort=c,student=s,year=year,grade=grade,seq=seq,exam=f'{seq}차',level=level,listening=l,reading=r,total=t,tier=g,note=note))
# ---- B: 2023 1M-S ----
B=['구성관','송지효','신준섭','박주연']
b1={'구성관':[(17,16,71,3),(17,16,72,3),(16,18,73,3),(17,21,83,2),(17,21,83,2)],
    '송지효':[(15,12,58,5),(17,20,81,2),(17,21,81,2),(17,25,92,1),(17,26,94,1)],
    '신준섭':[(16,16,70,3),(16,17,74,3),(17,16,70,3),(17,17,75,3),(17,18,75,3)],
    '박주연':[(17,15,69,4),(16,15,65,4),(16,17,71,3),(17,21,84,2),(17,18,75,3)]}
b2={'구성관':[(17,26,96,1),(17,27,97,1),(16,25,89,2),(17,28,100,1)],
    '송지효':[(17,28,100,1),(17,26,94,1),(17,25,92,1),(17,22,84,2)],
    '신준섭':[(17,24,90,1),(17,20,79,3),(17,26,94,1),(17,19,77,3)],
    '박주연':[(17,25,92,1),(17,22,86,2),(16,17,69,4),(15,18,70,3)]}
b3={'구성관':[(17,26,95,1),(16,26,92,1)],'송지효':[(17,26,95,1),(17,26,95,1)],
    '신준섭':[(17,23,89,2),(17,17,74,3)],'박주연':[(17,24,89,2),(16,23,85,2)]}
b3g3={'구성관':(17,28,100,1),'송지효':(17,28,100,1),'신준섭':(17,23,87,2),'박주연':(17,20,82,2)}
for s in B:
    for i,v in enumerate(b1[s]): add('B',s,2023,'중1',i+1,'고1 모의고사',*v)
    for i,v in enumerate(b2[s]): add('B',s,2024,'중2',i+1,'고1 모의고사' if i<2 else '고2 모의고사',*v)
    for i,v in enumerate(b3[s]): add('B',s,2025,'중3',i+1,'고2 모의고사',*v)
    add('B',s,2025,'중3',3,'고3 모의고사',*b3g3[s])
for s,v in {'구성관':(100,100,100),'송지효':(98,100,100),'신준섭':(95,95,90),'박주연':(99,96,89)}.items():
    for t,x in zip(['1학기 중간','1학기 기말','2학기 중간'],v):
        nae.append(dict(cohort='B',student=s,year=2025,grade='중3',term=t,score=x,note=None))
for s,(m,f) in {'구성관':(100,100),'송지효':(100,100),'신준섭':(100,96),'박주연':(95,98)}.items():
    nae.append(dict(cohort='B',student=s,year=2023,grade='중1',term='중간',score=m,note='학기 표기 없음'))
    nae.append(dict(cohort='B',student=s,year=2023,grade='중1',term='기말',score=f,note='학기 표기 없음'))
for s,v in {'구성관':100,'송지효':100,'신준섭':98,'박주연':99}.items():
    nae.append(dict(cohort='B',student=s,year=2024,grade='중2',term='기말',score=v,note='학기 표기 없음'))
# ---- C: 2025 1M-A ----
C=['김지수','김채율','이서연','황재성','서예준','이시원']
c1={'김지수':(14,16,63,4),'김채율':(17,11,59,5),'이서연':(17,23,88,2),'황재성':(15,17,67,4),'서예준':(16,8,51,5),'이시원':(None,None,62,4)}
c1more={ # 2025 중1 2차(총점만), 3차, 4차 (고1)
 '김지수':[(None,None,67,4),(16,16,68,4),(16,13,61,4)],
 '김채율':[(None,None,86,2),(17,18,76,3),(15,21,78,3)],
 '이서연':[(None,None,94,1),(17,24,91,1),(17,26,94,1)],
 '황재성':[(None,None,74,3),(15,18,71,3),(17,24,91,1)],
 '서예준':[(None,None,57,5),(16,16,68,4),(16,23,86,2)],
 '이시원':[(None,None,61,4),(16,16,69,4),(17,19,78,3)]}
c2={'김지수':[(15,16,66,4),(16,18,75,3),(17,19,77,3)],
    '김채율':[(17,23,87,2),(17,17,73,3),(16,19,76,3)],
    '이서연':[(17,23,87,2),(17,28,100,1),(17,26,95,1)],
    '황재성':[(17,24,88,2),(15,20,74,3),(17,21,82,2)],
    '서예준':[(17,18,73,3),(17,21,82,2),(17,20,80,2)],
    '이시원':[(17,17,73,3),(16,18,71,3),(17,19,77,3)]}
for s in C:
    add('C',s,2025,'중1',1,'고1 모의고사',*c1[s],note='듣기·독해 개수 기록 없음' if c1[s][0] is None else None)
    for i,v in enumerate(c1more[s]): add('C',s,2025,'중1',i+2,'고1 모의고사',*v,note='듣기·독해 개수 기록 없음' if v[0] is None else None)
    for i,v in enumerate(c2[s]): add('C',s,2026,'중2',i+1,'고1 모의고사' if i<2 else '고2 모의고사',*v)
for s,v in {'김지수':97,'김채율':98,'이서연':100,'황재성':100,'서예준':95,'이시원':95}.items():
    nae.append(dict(cohort='C',student=s,year=2025,grade='중1',term='2학기 중간',score=v,note=None))
for s,v in {'김지수':(100,97,100),'김채율':(89,100,94),'이서연':(100,100,99),'황재성':(95,100,95),'서예준':(88,85,92),'이시원':(90,100,100)}.items():
    for t,x in zip(['1학기 중간','1학기 기말','2학기 중간'],v):
        nae.append(dict(cohort='C',student=s,year=2026,grade='중2',term=t,score=x,note=None))
json.dump(dict(cohorts=COH,mock=mock,naesin=nae),open('data.json','w'),ensure_ascii=False,indent=1)
print(len(mock),len(nae))
