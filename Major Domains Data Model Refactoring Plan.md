Major Domains Data Model Refactoring Plan             
                                                  
Overview                                              
                                                  
Refactor from single polymorphic table to normalized  
schema with base table + type-specific tables, and    
split shared types into separate files. Since we're   
not in production, we'll do a clean migration without 
preserving existing data.                             
                                                  
Phase 1: Database Schema Design & Migration           
                                                  
1.1 New Database Schema                               
                                                  
Base Table: opportunity (common fields only)          
- id, label, address, zipCode, department, latitude,  
longitude                                             
- type, opportunityDate, externalId                   
- createdAt, updatedAt                                
- Removed: status, images, contactData, extraData     
                                                  
Type-Specific Tables:                                 
                                                  
opportunity_auction                                   
- opportunity_id (FK), url, auctionType, propertyType,
description                                          
- squareFootage, rooms, dpe, auctionVenue             
- currentPrice, reservePrice, lowerEstimate,          
upperEstimate (number fields)                         
- mainPicture (string), pictures (string array,       
optional)                                             
                                                  
opportunity_succession                                
- opportunity_id (FK), firstName, lastName            
- mairie contact info (from current contactData)      
                                                  
opportunity_liquidation                               
- opportunity_id (FK), siret                          
- company contact info (from current contactData)     
                                                  
opportunity_energy_sieve                              
- opportunity_id (FK), energyClass, dpeNumber         
                                                  
1.2 Migration Strategy                                
                                                  
- Drop existing opportunity table completely          
- Create fresh schema with new normalized structure   
- All existing data will be erased (acceptable since  
not in production)                                    
- No downtime concerns since not in production        
                                                  
Phase 2: Shared Types Refactoring                     
                                                  
2.1 Split                                             
packages/shared/src/types/opportunity.types.ts        
                                                  
New structure:                                        
packages/shared/src/types/                            
├── index.ts (exports all types)                      
├── base-opportunity.types.ts (OpportunityType enum,  
base interfaces)                                      
├── auction-opportunity.types.ts (with price fields + 
picture fields)                                       
├── succession-opportunity.types.ts                   
├── liquidation-opportunity.types.ts                  
└── energy-sieve-opportunity.types.ts                 
                                                  
2.2 Type Definition Updates                           
                                                  
- Remove status field from all opportunity types      
- Remove images field from base types                 
- Add auction-specific fields: currentPrice,          
reservePrice, lowerEstimate, upperEstimate,           
mainPicture, pictures                                 
- Create strongly typed schemas matching new database 
structure                                             
- Update all imports across codebase                  
                                                  
Phase 3: Repository & Domain Updates                  
                                                  
3.1 Repository Pattern Changes                        
                                                  
New pattern for each domain:                          
- Base repository handles common opportunity          
operations (without status/images)                    
- Type-specific repositories handle specialized data  
- Auction repository handles price fields and picture 
management                                            
- Update existing repositories in 4 implemented       
domains                                               
                                                  
3.2 Domain-Specific Changes                           
                                                  
Auctions domain:                                      
- Map price fields (currentPrice, reservePrice,       
lowerEstimate, upperEstimate) to opportunity_auction  
table                                                 
- Handle mainPicture and pictures array fields        
- Remove status field handling                        
                                                  
Other domains:                                        
- Deceases: Map firstName, lastName + mairie contact  
to opportunity_succession                             
- Liquidations: Map SIRET + company contact to        
opportunity_liquidation                               
- Energy Sieves: Map energyClass to                   
opportunity_energy_sieve                              
- Remove status field handling from all domains       
                                                  
Phase 4: Frontend & API Updates                       
                                                  
4.1 Query Strategy                                    
                                                  
- Frontend queries base opportunity table for listings
- Join with type-specific tables when detailed data   
needed                                                
- Remove status-based filtering                       
- Remove images field usage                           
- Add auction picture display (mainPicture + pictures 
array)                                                
                                                  
4.2 Auction-Specific UI Updates                       
                                                  
- Display mainPicture as primary auction image        
- Show additional pictures in gallery/carousel        
- Display price information (current, reserve,        
estimates)                                            
                                                  
Phase 5: Testing & Validation                         
                                                  
5.1 Fresh Data Testing                                
                                                  
- Test all 4 domain processors with new schema        
- Verify data populates correctly in new tables       
- Test auction price and picture field handling       
                                                  
5.2 Integration Testing                               
                                                  
- Frontend displays data correctly without            
status/images                                         
- Auction-specific price and picture features work    
- All existing functionality preserved (minus removed 
fields)                                               
                                                  
Implementation Order                                  
                                                  
1. Database schema creation (packages/db) - fresh     
tables                                                
2. Shared types refactoring (packages/shared) - remove
status/images, add auction fields                    
3. Repository updates (scraping-worker,               
sourcing-worker) - handle new schema                  
4. Frontend integration (packages/frontend) - auction 
pictures, remove status/images                        
5. Testing & validation                               
                                                  
Key Changes from Original Plan                        
                                                  
- ✅ Removed status field entirely                     
- ✅ Removed images field entirely                     
- ✅ Added auction price fields (currentPrice,         
reservePrice, lowerEstimate, upperEstimate)           
- ✅ Added auction picture fields (mainPicture,        
pictures array)                                       
- ✅ Simplified migration - fresh start without data   
preservation                                          
- ✅ No production concerns or downtime considerations 
                                                  
Benefits                                              
                                                  
- ✅ Cleaner schema without unnecessary status/images  
fields                                                
- ✅ Proper auction price tracking with dedicated      
fields                                                
- ✅ Better picture management for auctions (main +    
gallery)                                              
- ✅ Strongly typed schemas eliminate JSONB ambiguity  
- ✅ Easier development without production migration   
constraints                                           
                                                  
Estimated timeline: 1.5-2 weeks for full              
implementation                                        
                                                  
