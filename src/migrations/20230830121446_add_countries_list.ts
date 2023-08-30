import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `INSERT INTO ms_countries VALUES (1,'AF','Afghanistan','93','Y',NULL,NULL,NULL,NULL),(2,'AL','Albania','355','Y',NULL,NULL,NULL,NULL),(3,'DZ','Algeria','213','Y',NULL,NULL,NULL,NULL),(4,'AS','American Samoa','1684','Y',NULL,NULL,NULL,NULL),(5,'AD','Andorra','376','Y',NULL,NULL,NULL,NULL),(6,'AO','Angola','244','Y',NULL,NULL,NULL,NULL),(7,'AI','Anguilla','1264','Y',NULL,NULL,NULL,NULL),(8,'AQ','Antarctica','0','Y',NULL,NULL,NULL,NULL),(9,'AG','Antigua And Barbuda','1268','Y',NULL,NULL,NULL,NULL),(10,'AR','Argentina','54','Y',NULL,NULL,NULL,NULL),(11,'AM','Armenia','374','Y',NULL,NULL,NULL,NULL),(12,'AW','Aruba','297','Y',NULL,NULL,NULL,NULL),(13,'AU','Australia','61','Y',NULL,NULL,NULL,NULL),(14,'AT','Austria','43','Y',NULL,NULL,NULL,NULL),(15,'AZ','Azerbaijan','994','Y',NULL,NULL,NULL,NULL),(16,'BS','Bahamas The','1242','Y',NULL,NULL,NULL,NULL),(17,'BH','Bahrain','973','Y',NULL,NULL,NULL,NULL),(18,'BD','Bangladesh','880','Y',NULL,NULL,NULL,NULL),(19,'BB','Barbados','1246','Y',NULL,NULL,NULL,NULL),(20,'BY','Belarus','375','Y',NULL,NULL,NULL,NULL),(21,'BE','Belgium','32','Y',NULL,NULL,NULL,NULL),(22,'BZ','Belize','501','Y',NULL,NULL,NULL,NULL),(23,'BJ','Benin','229','Y',NULL,NULL,NULL,NULL),(24,'BM','Bermuda','1441','Y',NULL,NULL,NULL,NULL),(25,'BT','Bhutan','975','Y',NULL,NULL,NULL,NULL),(26,'BO','Bolivia','591','Y',NULL,NULL,NULL,NULL),(27,'BA','Bosnia and Herzegovina','387','Y',NULL,NULL,NULL,NULL),(28,'BW','Botswana','267','Y',NULL,NULL,NULL,NULL),(29,'BV','Bouvet Island','0','Y',NULL,NULL,NULL,NULL),(30,'BR','Brazil','55','Y',NULL,NULL,NULL,NULL),(31,'IO','British Indian Ocean Territory','246','Y',NULL,NULL,NULL,NULL),(32,'BN','Brunei','673','Y',NULL,NULL,NULL,NULL),(33,'BG','Bulgaria','359','Y',NULL,NULL,NULL,NULL),(34,'BF','Burkina Faso','226','Y',NULL,NULL,NULL,NULL),(35,'BI','Burundi','257','Y',NULL,NULL,NULL,NULL),(36,'KH','Cambodia','855','Y',NULL,NULL,NULL,NULL),(37,'CM','Cameroon','237','Y',NULL,NULL,NULL,NULL),(38,'CA','Canada','1','Y',NULL,NULL,NULL,NULL),(39,'CV','Cape Verde','238','Y',NULL,NULL,NULL,NULL),(40,'KY','Cayman Islands','1345','Y',NULL,NULL,NULL,NULL),(41,'CF','Central African Republic','236','Y',NULL,NULL,NULL,NULL),(42,'TD','Chad','235','Y',NULL,NULL,NULL,NULL),(43,'CL','Chile','56','Y',NULL,NULL,NULL,NULL),(44,'CN','China','86','Y',NULL,NULL,NULL,NULL),(45,'CX','Christmas Island','61','Y',NULL,NULL,NULL,NULL),(46,'CC','Cocos (Keeling) Islands','672','Y',NULL,NULL,NULL,NULL),(47,'CO','Colombia','57','Y',NULL,NULL,NULL,NULL),(48,'KM','Comoros','269','Y',NULL,NULL,NULL,NULL),(49,'CG','Republic Of The Congo','242','Y',NULL,NULL,NULL,NULL),(50,'CD','Democratic Republic Of The Congo','242','Y',NULL,NULL,NULL,NULL),(51,'CK','Cook Islands','682','Y',NULL,NULL,NULL,NULL),(52,'CR','Costa Rica','506','Y',NULL,NULL,NULL,NULL),(53,'CI','Cote DIvoire (Ivory Coast)','225','Y',NULL,NULL,NULL,NULL),(54,'HR','Croatia (Hrvatska)','385','Y',NULL,NULL,NULL,NULL),(55,'CU','Cuba','53','Y',NULL,NULL,NULL,NULL),(56,'CY','Cyprus','357','Y',NULL,NULL,NULL,NULL),(57,'CZ','Czech Republic','420','Y',NULL,NULL,NULL,NULL),(58,'DK','Denmark','45','Y',NULL,NULL,NULL,NULL),(59,'DJ','Djibouti','253','Y',NULL,NULL,NULL,NULL),(60,'DM','Dominica','1767','Y',NULL,NULL,NULL,NULL),(61,'DO','Dominican Republic','1809','Y',NULL,NULL,NULL,NULL),(62,'TP','East Timor','670','Y',NULL,NULL,NULL,NULL),(63,'EC','Ecuador','593','Y',NULL,NULL,NULL,NULL),(64,'EG','Egypt','20','Y',NULL,NULL,NULL,NULL),(65,'SV','El Salvador','503','Y',NULL,NULL,NULL,NULL),(66,'GQ','Equatorial Guinea','240','Y',NULL,NULL,NULL,NULL),(67,'ER','Eritrea','291','Y',NULL,NULL,NULL,NULL),(68,'EE','Estonia','372','Y',NULL,NULL,NULL,NULL),(69,'ET','Ethiopia','251','Y',NULL,NULL,NULL,NULL),(70,'XA','External Territories of Australia','61','Y',NULL,NULL,NULL,NULL),(71,'FK','Falkland Islands','500','Y',NULL,NULL,NULL,NULL),(72,'FO','Faroe Islands','298','Y',NULL,NULL,NULL,NULL),(73,'FJ','Fiji Islands','679','Y',NULL,NULL,NULL,NULL),(74,'FI','Finland','358','Y',NULL,NULL,NULL,NULL),(75,'FR','France','33','Y',NULL,NULL,NULL,NULL),(76,'GF','French Guiana','594','Y',NULL,NULL,NULL,NULL),(77,'PF','French Polynesia','689','Y',NULL,NULL,NULL,NULL),(78,'TF','French Southern Territories','0','Y',NULL,NULL,NULL,NULL),(79,'GA','Gabon','241','Y',NULL,NULL,NULL,NULL),(80,'GM','Gambia The','220','Y',NULL,NULL,NULL,NULL),(81,'GE','Georgia','995','Y',NULL,NULL,NULL,NULL),(82,'DE','Germany','49','Y',NULL,NULL,NULL,NULL),(83,'GH','Ghana','233','Y',NULL,NULL,NULL,NULL),(84,'GI','Gibraltar','350','Y',NULL,NULL,NULL,NULL),(85,'GR','Greece','30','Y',NULL,NULL,NULL,NULL),(86,'GL','Greenland','299','Y',NULL,NULL,NULL,NULL),(87,'GD','Grenada','1473','Y',NULL,NULL,NULL,NULL),(88,'GP','Guadeloupe','590','Y',NULL,NULL,NULL,NULL),(89,'GU','Guam','1671','Y',NULL,NULL,NULL,NULL),(90,'GT','Guatemala','502','Y',NULL,NULL,NULL,NULL),(91,'XU','Guernsey and Alderney','44','Y',NULL,NULL,NULL,NULL),(92,'GN','Guinea','224','Y',NULL,NULL,NULL,NULL),(93,'GW','Guinea-Bissau','245','Y',NULL,NULL,NULL,NULL),(94,'GY','Guyana','592','Y',NULL,NULL,NULL,NULL),(95,'HT','Haiti','509','Y',NULL,NULL,NULL,NULL),(96,'HM','Heard and McDonald Islands','0','Y',NULL,NULL,NULL,NULL),(97,'HN','Honduras','504','Y',NULL,NULL,NULL,NULL),(98,'HK','Hong Kong S.A.R.','852','Y',NULL,NULL,NULL,NULL),(99,'HU','Hungary','36','Y',NULL,NULL,NULL,NULL),(100,'IS','Iceland','354','Y',NULL,NULL,NULL,NULL),(101,'IN','India','91','Y',NULL,NULL,NULL,NULL),(102,'ID','Indonesia','62','Y',NULL,NULL,NULL,NULL),(103,'IR','Iran','98','Y',NULL,NULL,NULL,NULL),(104,'IQ','Iraq','964','Y',NULL,NULL,NULL,NULL),(105,'IE','Ireland','353','Y',NULL,NULL,NULL,NULL),(106,'IL','Israel','972','Y',NULL,NULL,NULL,NULL),(107,'IT','Italy','39','Y',NULL,NULL,NULL,NULL),(108,'JM','Jamaica','1876','Y',NULL,NULL,NULL,NULL),(109,'JP','Japan','81','Y',NULL,NULL,NULL,NULL),(110,'XJ','Jersey','44','Y',NULL,NULL,NULL,NULL),(111,'JO','Jordan','962','Y',NULL,NULL,NULL,NULL),(112,'KZ','Kazakhstan','7','Y',NULL,NULL,NULL,NULL),(113,'KE','Kenya','254','Y',NULL,NULL,NULL,NULL),(114,'KI','Kiribati','686','Y',NULL,NULL,NULL,NULL),(115,'KP','Korea North','850','Y',NULL,NULL,NULL,NULL),(116,'KR','Korea South','82','Y',NULL,NULL,NULL,NULL),(117,'KW','Kuwait','965','Y',NULL,NULL,NULL,NULL),(118,'KG','Kyrgyzstan','996','Y',NULL,NULL,NULL,NULL),(119,'LA','Laos','856','Y',NULL,NULL,NULL,NULL),(120,'LV','Latvia','371','Y',NULL,NULL,NULL,NULL),(121,'LB','Lebanon','961','Y',NULL,NULL,NULL,NULL),(122,'LS','Lesotho','266','Y',NULL,NULL,NULL,NULL),(123,'LR','Liberia','231','Y',NULL,NULL,NULL,NULL),(124,'LY','Libya','218','Y',NULL,NULL,NULL,NULL),(125,'LI','Liechtenstein','423','Y',NULL,NULL,NULL,NULL),(126,'LT','Lithuania','370','Y',NULL,NULL,NULL,NULL),(127,'LU','Luxembourg','352','Y',NULL,NULL,NULL,NULL),(128,'MO','Macau S.A.R.','853','Y',NULL,NULL,NULL,NULL),(129,'MK','Macedonia','389','Y',NULL,NULL,NULL,NULL),(130,'MG','Madagascar','261','Y',NULL,NULL,NULL,NULL),(131,'MW','Malawi','265','Y',NULL,NULL,NULL,NULL),(132,'MY','Malaysia','60','Y',NULL,NULL,NULL,NULL),(133,'MV','Maldives','960','Y',NULL,NULL,NULL,NULL),(134,'ML','Mali','223','Y',NULL,NULL,NULL,NULL),(135,'MT','Malta','356','Y',NULL,NULL,NULL,NULL),(136,'XM','Man (Isle of)','44','Y',NULL,NULL,NULL,NULL),(137,'MH','Marshall Islands','692','Y',NULL,NULL,NULL,NULL),(138,'MQ','Martinique','596','Y',NULL,NULL,NULL,NULL),(139,'MR','Mauritania','222','Y',NULL,NULL,NULL,NULL),(140,'MU','Mauritius','230','Y',NULL,NULL,NULL,NULL),(141,'YT','Mayotte','269','Y',NULL,NULL,NULL,NULL),(142,'MX','Mexico','52','Y',NULL,NULL,NULL,NULL),(143,'FM','Micronesia','691','Y',NULL,NULL,NULL,NULL),(144,'MD','Moldova','373','Y',NULL,NULL,NULL,NULL),(145,'MC','Monaco','377','Y',NULL,NULL,NULL,NULL),(146,'MN','Mongolia','976','Y',NULL,NULL,NULL,NULL),(147,'MS','Montserrat','1664','Y',NULL,NULL,NULL,NULL),(148,'MA','Morocco','212','Y',NULL,NULL,NULL,NULL),(149,'MZ','Mozambique','258','Y',NULL,NULL,NULL,NULL),(150,'MM','Myanmar','95','Y',NULL,NULL,NULL,NULL),(151,'NA','Namibia','264','Y',NULL,NULL,NULL,NULL),(152,'NR','Nauru','674','Y',NULL,NULL,NULL,NULL),(153,'NP','Nepal','977','Y',NULL,NULL,NULL,NULL),(154,'AN','Netherlands Antilles','599','Y',NULL,NULL,NULL,NULL),(155,'NL','Netherlands The','31','Y',NULL,NULL,NULL,NULL),(156,'NC','New Caledonia','687','Y',NULL,NULL,NULL,NULL),(157,'NZ','New Zealand','64','Y',NULL,NULL,NULL,NULL),(158,'NI','Nicaragua','505','Y',NULL,NULL,NULL,NULL),(159,'NE','Niger','227','Y',NULL,NULL,NULL,NULL),(160,'NG','Nigeria','234','Y',NULL,NULL,NULL,NULL),(161,'NU','Niue','683','Y',NULL,NULL,NULL,NULL),(162,'NF','Norfolk Island','672','Y',NULL,NULL,NULL,NULL),(163,'MP','Northern Mariana Islands','1670','Y',NULL,NULL,NULL,NULL),(164,'NO','Norway','47','Y',NULL,NULL,NULL,NULL),(165,'OM','Oman','968','Y',NULL,NULL,NULL,NULL),(166,'PK','Pakistan','92','Y',NULL,NULL,NULL,NULL),(167,'PW','Palau','680','Y',NULL,NULL,NULL,NULL),(168,'PS','Palestinian Territory Occupied','970','Y',NULL,NULL,NULL,NULL),(169,'PA','Panama','507','Y',NULL,NULL,NULL,NULL),(170,'PG','Papua new Guinea','675','Y',NULL,NULL,NULL,NULL),(171,'PY','Paraguay','595','Y',NULL,NULL,NULL,NULL),(172,'PE','Peru','51','Y',NULL,NULL,NULL,NULL),(173,'PH','Philippines','63','Y',NULL,NULL,NULL,NULL),(174,'PN','Pitcairn Island','0','Y',NULL,NULL,NULL,NULL),(175,'PL','Poland','48','Y',NULL,NULL,NULL,NULL),(176,'PT','Portugal','351','Y',NULL,NULL,NULL,NULL),(177,'PR','Puerto Rico','1787','Y',NULL,NULL,NULL,NULL),(178,'QA','Qatar','974','Y',NULL,NULL,NULL,NULL),(179,'RE','Reunion','262','Y',NULL,NULL,NULL,NULL),(180,'RO','Romania','40','Y',NULL,NULL,NULL,NULL),(181,'RU','Russia','70','Y',NULL,NULL,NULL,NULL),(182,'RW','Rwanda','250','Y',NULL,NULL,NULL,NULL),(183,'SH','Saint Helena','290','Y',NULL,NULL,NULL,NULL),(184,'KN','Saint Kitts And Nevis','1869','Y',NULL,NULL,NULL,NULL),(185,'LC','Saint Lucia','1758','Y',NULL,NULL,NULL,NULL),(186,'PM','Saint Pierre and Miquelon','508','Y',NULL,NULL,NULL,NULL),(187,'VC','Saint Vincent And The Grenadines','1784','Y',NULL,NULL,NULL,NULL),(188,'WS','Samoa','684','Y',NULL,NULL,NULL,NULL),(189,'SM','San Marino','378','Y',NULL,NULL,NULL,NULL),(190,'ST','Sao Tome and Principe','239','Y',NULL,NULL,NULL,NULL),(191,'SA','Saudi Arabia','966','Y',NULL,NULL,NULL,NULL),(192,'SN','Senegal','221','Y',NULL,NULL,NULL,NULL),(193,'RS','Serbia','381','Y',NULL,NULL,NULL,NULL),(194,'SC','Seychelles','248','Y',NULL,NULL,NULL,NULL),(195,'SL','Sierra Leone','232','Y',NULL,NULL,NULL,NULL),(196,'SG','Singapore','65','Y',NULL,NULL,NULL,NULL),(197,'SK','Slovakia','421','Y',NULL,NULL,NULL,NULL),(198,'SI','Slovenia','386','Y',NULL,NULL,NULL,NULL),(199,'XG','Smaller Territories of the UK','44','Y',NULL,NULL,NULL,NULL),(200,'SB','Solomon Islands','677','Y',NULL,NULL,NULL,NULL),(201,'SO','Somalia','252','Y',NULL,NULL,NULL,NULL),(202,'ZA','South Africa','27','Y',NULL,NULL,NULL,NULL),(203,'GS','South Georgia','0','Y',NULL,NULL,NULL,NULL),(204,'SS','South Sudan','211','Y',NULL,NULL,NULL,NULL),(205,'ES','Spain','34','Y',NULL,NULL,NULL,NULL),(206,'LK','Sri Lanka','94','Y',NULL,NULL,NULL,NULL),(207,'SD','Sudan','249','Y',NULL,NULL,NULL,NULL),(208,'SR','Suriname','597','Y',NULL,NULL,NULL,NULL),(209,'SJ','Svalbard And Jan Mayen Islands','47','Y',NULL,NULL,NULL,NULL),(210,'SZ','Swaziland','268','Y',NULL,NULL,NULL,NULL),(211,'SE','Sweden','46','Y',NULL,NULL,NULL,NULL),(212,'CH','Switzerland','41','Y',NULL,NULL,NULL,NULL),(213,'SY','Syria','963','Y',NULL,NULL,NULL,NULL),(214,'TW','Taiwan','886','Y',NULL,NULL,NULL,NULL),(215,'TJ','Tajikistan','992','Y',NULL,NULL,NULL,NULL),(216,'TZ','Tanzania','255','Y',NULL,NULL,NULL,NULL),(217,'TH','Thailand','66','Y',NULL,NULL,NULL,NULL),(218,'TG','Togo','228','Y',NULL,NULL,NULL,NULL),(219,'TK','Tokelau','690','Y',NULL,NULL,NULL,NULL),(220,'TO','Tonga','676','Y',NULL,NULL,NULL,NULL),(221,'TT','Trinidad And Tobago','1868','Y',NULL,NULL,NULL,NULL),(222,'TN','Tunisia','216','Y',NULL,NULL,NULL,NULL),(223,'TR','Turkey','90','Y',NULL,NULL,NULL,NULL),(224,'TM','Turkmenistan','7370','Y',NULL,NULL,NULL,NULL),(225,'TC','Turks And Caicos Islands','1649','Y',NULL,NULL,NULL,NULL),(226,'TV','Tuvalu','688','Y',NULL,NULL,NULL,NULL),(227,'UG','Uganda','256','Y',NULL,NULL,NULL,NULL),(228,'UA','Ukraine','380','Y',NULL,NULL,NULL,NULL),(229,'AE','United Arab Emirates','971','Y',NULL,NULL,NULL,NULL),(230,'GB','United Kingdom','44','Y',NULL,NULL,NULL,NULL),(231,'US','United States','1','Y',NULL,NULL,NULL,NULL),(232,'UM','United States Minor Outlying Islands','1','Y',NULL,NULL,NULL,NULL),(233,'UY','Uruguay','598','Y',NULL,NULL,NULL,NULL),(234,'UZ','Uzbekistan','998','Y',NULL,NULL,NULL,NULL),(235,'VU','Vanuatu','678','Y',NULL,NULL,NULL,NULL),(236,'VA','Vatican City State (Holy See)','39','Y',NULL,NULL,NULL,NULL),(237,'VE','Venezuela','58','Y',NULL,NULL,NULL,NULL),(238,'VN','Vietnam','84','Y',NULL,NULL,NULL,NULL),(239,'VG','Virgin Islands (British)','1284','Y',NULL,NULL,NULL,NULL),(240,'VI','Virgin Islands (US)','1340','Y',NULL,NULL,NULL,NULL),(241,'WF','Wallis And Futuna Islands','681','Y',NULL,NULL,NULL,NULL),(242,'EH','Western Sahara','212','Y',NULL,NULL,NULL,NULL),(243,'YE','Yemen','967','Y',NULL,NULL,NULL,NULL),(244,'YU','Yugoslavia','38','Y',NULL,NULL,NULL,NULL),(245,'ZM','Zambia','260','Y',NULL,NULL,NULL,NULL),(246,'ZW','Zimbabwe','263','Y',NULL,NULL,NULL,NULL);`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex('ms_countries').truncate();
}