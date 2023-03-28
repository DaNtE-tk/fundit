import React, {useContext, createContext} from "react";

import {useAddress, useContract, useMetamask, useContractWrite, contractType} from '@thirdweb-dev/react';
import { ethers } from "ethers";
// import { createCampaign } from "../assets";

const StateContext = createContext();

export const StateContextProvider = ({children}) =>{

    // Populated
    const {contract} = useContract('0x1AE0C7c2FCbf90Cf748Bc000241CFC625bA9d496');

    // Blank
    // const {contract} = useContract('0xEFAE31E88C9B55f49AC095636Cf7E0B087728c39');
    const {mutateAsync: createCampaign} = useContractWrite(contract, 'createCampaign');

    const address = useAddress();
    const connect = useMetamask();

    const publishCampaign = async(form)=>{
        try {
            const data = await createCampaign([
                address, //owner
                form.title,
                form.description,
                form.target,
                new Date(form.deadline).getTime(), //deadline
                form.image
            ])   
            console.log("Contract call success",data);
        } catch (error) {
            console.log("Contract call failure",error);
        }
    }

    const getCampaigns = async() =>{
        const campaigns = await contract.call('getCampaings');
        
        const parsedCampaigns = campaigns.map((campaign,i) => ({
            owner:campaign.owner,
            title:campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline:campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image:campaign.image,
            pId:i
        }));   
         console.log(parsedCampaigns);
        return parsedCampaigns;
    }

    const getUserCampaigns = async () =>{
        const allCampaigns = await getCampaigns();
        const filteredCampaigns = allCampaigns.filter((campaign)=> campaign.owner===address);
        return filteredCampaigns;
    }

    const donate = async (pId, amount)=>{
        const data = await contract.call('donateToCampaign', pId,{value:ethers.utils.parseEther(amount)});
        return data;
    }

    const getDonations = async(pId)=>{
        const donations = await contract.call('getDonators', pId);
        const numberOfDonations = donations[0].length;
        const parsedDonations = [];

        for(let i=0;i<numberOfDonations;i++){
            parsedDonations.push({
                donators:donations[0][i],
                donations: ethers.utils.formatEther(donations[1][i].toString())
            })
        }
        return parsedDonations;
    }


    return (
        <StateContext.Provider 
            value={{
                address,
                contract,
                connect,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations
            }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);