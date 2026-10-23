/*
 * Starter dataset for Rated+Unrated Demonlist.
 * These entries are fictional examples for demonstrating the interface.
 * Replace them with researched/verified level data before publishing.
 *
 * Schema: id, name, creator, levelId, officialStatus, difficulty,
 * verification, listStatus, rank, bestRecord, notes
 */
window.DEMONLIST_DATA = {
  levels: [
    {id:"demo-001",name:"Abyssal Bloom",creator:"ExampleCreator",levelId:"10000001",officialStatus:"Rated",difficulty:"Extreme Demon",verification:"Verified",listStatus:"Mainlist",rank:1,bestRecord:100,notes:"Illustrative sample entry — not a real ranking."},
    {id:"demo-002",name:"Neon Cataclysm",creator:"SampleBuilder",levelId:"10000002",officialStatus:"Unrated",difficulty:"Extreme Demon",verification:"Verified",listStatus:"Mainlist",rank:2,bestRecord:92,notes:"Illustrative sample entry — not a real ranking."},
    {id:"demo-003",name:"Azurite",creator:"SILLOW",levelId:"",officialStatus:"Unrated",difficulty:"Extreme Demon",verification:"Unverified",listStatus:"Extended",rank:3,bestRecord:0,notes:"Example placeholder. Enter the correct level ID and community-confirmed details before publishing."},
    {id:"demo-004",name:"Crimson Circuit",creator:"ExampleCreator",levelId:"10000004",officialStatus:"Rated",difficulty:"Insane Demon",verification:"Verified",listStatus:"Mainlist",rank:4,bestRecord:100,notes:"Illustrative sample entry — not a real ranking."},
    {id:"demo-005",name:"Quiet Machine",creator:"SampleBuilder",levelId:"10000005",officialStatus:"Unrated",difficulty:"Hard Demon",verification:"Verified",listStatus:"Extended",rank:5,bestRecord:87,notes:"Illustrative sample entry — not a real ranking."},
    {id:"demo-006",name:"Old Signal",creator:"ArchiveTeam",levelId:"10000006",officialStatus:"Legacy",difficulty:"Extreme Demon",verification:"Verified",listStatus:"Legacy",rank:6,bestRecord:100,notes:"Illustrative sample entry — legacy category demo."},
    {id:"demo-007",name:"Frame Perfect",creator:"ChallengeMaker",levelId:"10000007",officialStatus:"Unrated",difficulty:"Challenge",verification:"Verified",listStatus:"Challenge",rank:7,bestRecord:74,notes:"Illustrative challenge entry."},
    {id:"demo-008",name:"Glass Horizon",creator:"ExampleCreator",levelId:"10000008",officialStatus:"Rated",difficulty:"Easy Demon",verification:"Verified",listStatus:"Extended",rank:8,bestRecord:100,notes:"Illustrative sample entry — not a real ranking."}
  ],
  records: [
    {id:"rec-001",player:"ExamplePlayer",levelId:"demo-001",percent:100,proof:"",status:"Approved",date:"2026-01-12"},
    {id:"rec-002",player:"SampleGD",levelId:"demo-002",percent:92,proof:"",status:"Approved",date:"2026-02-03"},
    {id:"rec-003",player:"ExamplePlayer",levelId:"demo-003",percent:83,proof:"",status:"Pending",date:"2026-02-10"},
    {id:"rec-004",player:"DashFan",levelId:"demo-004",percent:100,proof:"",status:"Approved",date:"2026-02-14"},
    {id:"rec-005",player:"SampleGD",levelId:"demo-005",percent:87,proof:"",status:"Approved",date:"2026-03-02"}
  ],
  submissions: []
};